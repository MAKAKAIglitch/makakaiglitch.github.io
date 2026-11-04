#!/usr/bin/env python3
"""Refresh a static, public GitHub repository snapshot for MAKAKAIglitch Pages."""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

OWNER = "MAKAKAIglitch"
API = "https://api.github.com"
TIMEOUT = 20
WORKERS = 6
STORED_RELEASES = 20


def request_json(path: str) -> tuple[Any, dict[str, str]]:
    url = path if path.startswith("https://") else API + path
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "MAKAKAIglitch-RepositorySnapshot/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
            body = response.read(8 * 1024 * 1024 + 1)
            if len(body) > 8 * 1024 * 1024:
                raise RuntimeError("GitHub API response exceeded 8 MiB")
            return json.loads(body.decode("utf-8")), {
                key.lower(): value for key, value in response.headers.items()
            }
    except urllib.error.HTTPError as error:
        detail = error.read(400).decode("utf-8", errors="replace")
        remaining = error.headers.get("X-RateLimit-Remaining", "unknown")
        raise RuntimeError(
            f"GitHub API HTTP {error.code}; remaining={remaining}; {detail[:180]}"
        ) from error


def last_page(headers: dict[str, str]) -> int | None:
    match = re.search(
        r'<[^>]*[?&]page=(\d+)[^>]*>\s*;\s*rel="last"',
        headers.get("link", ""),
    )
    return int(match.group(1)) if match else None


def normalize(raw: dict[str, Any]) -> dict[str, Any]:
    owner = raw.get("owner") or {}
    parent = raw.get("parent") or {}
    license_data = raw.get("license") or {}
    keys = (
        "id", "name", "full_name", "html_url", "description", "fork", "archived",
        "created_at", "updated_at", "pushed_at", "stargazers_count", "watchers_count",
        "forks_count", "open_issues_count", "language", "default_branch", "size",
        "topics", "homepage", "clone_url",
    )
    item = {key: raw.get(key) for key in keys}
    item["owner"] = {"login": owner.get("login", "")}
    item["subscribers_count"] = raw.get("subscribers_count")
    item["license"] = (
        {"key": license_data.get("key"), "name": license_data.get("name"),
         "spdx_id": license_data.get("spdx_id")}
        if license_data else None
    )
    item["parent"] = (
        {"full_name": parent.get("full_name"), "html_url": parent.get("html_url")}
        if parent else None
    )
    return item


def fetch_repositories() -> tuple[list[dict[str, Any]], dict[str, str]]:
    result: list[dict[str, Any]] = []
    headers: dict[str, str] = {}
    for page in range(1, 11):
        query = urllib.parse.urlencode({
            "type": "owner", "sort": "updated", "direction": "desc",
            "per_page": 100, "page": page,
        })
        payload, headers = request_json(f"/users/{OWNER}/repos?{query}")
        if not isinstance(payload, list):
            raise RuntimeError("GitHub returned an invalid repository collection")
        result.extend(
            normalize(repo) for repo in payload
            if isinstance(repo, dict)
            and (repo.get("owner") or {}).get("login", "").lower() == OWNER.lower()
            and not repo.get("private", False)
        )
        if len(payload) < 100:
            break
    if not result:
        raise RuntimeError("GitHub returned no public repositories; keeping previous snapshot")
    unique = {item["full_name"].lower(): item for item in result if item.get("full_name")}
    return sorted(unique.values(), key=lambda item: item.get("updated_at") or "", reverse=True), headers


def collection_count(path: str) -> int:
    payload, headers = request_json(path)
    if not isinstance(payload, list):
        raise RuntimeError("Expected a list at " + path)
    return last_page(headers) or len(payload)


def details_for(repo: dict[str, Any], previous: dict[str, Any] | None) -> dict[str, Any]:
    old = previous if isinstance(previous, dict) else {}
    base = f"/repos/{repo['full_name']}"
    details = {
        "languages": old.get("languages") or {},
        "releases": old.get("releases") or [],
        "releases_count": old.get("releases_count"),
        "release_downloads": old.get("release_downloads"),
        "release_downloads_scope": old.get("release_downloads_scope", "all"),
        "contributors_count": old.get("contributors_count"),
        "commits_count": old.get("commits_count"),
        "branches_count": old.get("branches_count"),
    }
    warnings: list[str] = []

    try:
        data, _ = request_json(base + "/languages")
        if isinstance(data, dict):
            details["languages"] = data
    except Exception as error:
        warnings.append("languages: " + str(error))

    try:
        releases, headers = request_json(base + "/releases?per_page=100")
        if not isinstance(releases, list):
            raise RuntimeError("Invalid release list")
        pages = last_page(headers) or 1
        release_count = len(releases)
        if pages > 1:
            last_items, _ = request_json(base + f"/releases?per_page=100&page={pages}")
            release_count = (pages - 1) * 100 + len(last_items)
        download_count = sum(
            int(asset.get("download_count") or 0)
            for release in releases if isinstance(release, dict)
            for asset in (release.get("assets") or []) if isinstance(asset, dict)
        )
        compact = []
        for release in releases[:STORED_RELEASES]:
            if not isinstance(release, dict):
                continue
            assets = [{
                "name": asset.get("name"),
                "browser_download_url": asset.get("browser_download_url"),
                "download_count": asset.get("download_count", 0),
                "size": asset.get("size", 0),
            } for asset in (release.get("assets") or []) if isinstance(asset, dict)]
            compact.append({
                "name": release.get("name"), "tag_name": release.get("tag_name"),
                "published_at": release.get("published_at"), "html_url": release.get("html_url"),
                "assets": assets,
            })
        details.update({
            "releases": compact,
            "releases_count": release_count,
            "release_downloads": download_count,
            "release_downloads_scope": "latest_100" if pages > 1 else "all",
        })
    except Exception as error:
        warnings.append("releases: " + str(error))

    for key, endpoint in (
        ("contributors_count", "/contributors?per_page=1"),
        ("commits_count", "/commits?per_page=1"),
        ("branches_count", "/branches?per_page=1"),
    ):
        try:
            details[key] = collection_count(base + endpoint)
        except Exception as error:
            warnings.append(key + ": " + str(error))

    if warnings:
        details["warnings"] = warnings[:5]
    details["generated_at"] = dt.datetime.now(dt.timezone.utc).replace(
        microsecond=0
    ).isoformat().replace("+00:00", "Z")
    return details


def run(output: Path) -> None:
    previous: dict[str, Any] = {}
    if output.exists():
        try:
            previous = json.loads(output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = {}
    old_items = {
        item.get("full_name", "").lower(): item
        for item in previous.get("items", [])
        if isinstance(item, dict)
    } if isinstance(previous, dict) else {}

    repositories, headers = fetch_repositories()
    print(f"Found {len(repositories)} public repositories, including forks.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = []
        for repo in repositories:
            old_details = old_items.get(repo["full_name"].lower(), {}).get("details")
            futures.append((repo, pool.submit(details_for, repo, old_details)))
        for repo, future in futures:
            try:
                repo["details"] = future.result()
            except Exception as error:
                repo["details"] = old_items.get(repo["full_name"].lower(), {}).get("details")
                print(f"Details failed for {repo['full_name']}: {error}")

    document = {
        "schema_version": 1,
        "generated_at": dt.datetime.now(dt.timezone.utc).replace(
            microsecond=0
        ).isoformat().replace("+00:00", "Z"),
        "source": "GitHub REST API via GitHub Actions",
        "repository_count": len(repositories),
        "fork_count": sum(bool(repo.get("fork")) for repo in repositories),
        "rate_limit_remaining": headers.get("x-ratelimit-remaining"),
        "items": repositories,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(output.suffix + ".tmp")
    temporary.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(f"Snapshot saved: {len(repositories)} repositories, {document['fork_count']} forks.")


def self_test() -> None:
    assert last_page({"link": '<https://api.github.com/items?page=9>; rel="last"'}) == 9
    assert last_page({"link": ""}) is None
    sample = normalize({
        "id": 1, "name": "test", "full_name": OWNER + "/test",
        "owner": {"login": OWNER}, "fork": True,
        "license": {"name": "MIT", "spdx_id": "MIT"},
        "parent": {"full_name": "upstream/test", "html_url": "https://github.com/upstream/test"},
    })
    assert sample["fork"] is True and sample["parent"]["full_name"] == "upstream/test"
    assert sample["license"]["spdx_id"] == "MIT"
    print("Repository snapshot self-test passed.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("data/repositories.json"))
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        run(args.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())

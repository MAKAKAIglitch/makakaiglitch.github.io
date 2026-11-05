#!/usr/bin/env python3
"""GitHub Actions collector for the public Service Status Monitor.

The previous snapshot is read from the currently published GitHub Pages site.
The new snapshot is written to data/service-status.json and included in the
same Pages deployment. No API keys, database, Cloudflare Worker or commits
containing monitoring data are required.
"""
from __future__ import annotations

import argparse
import gzip
import json
import math
import os
import re
import socket
import sys
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "service-status-catalog.json"
STATE_PATH = ROOT / "data" / "service-status-state.json"
SUMMARY_PATH = ROOT / "data" / "service-status.json"
HISTORY_DIR = ROOT / "data" / "service-status" / "history"

INTERVAL_SECONDS = 300
PROBE_TIMEOUT_SECONDS = 8
STATUS_TIMEOUT_SECONDS = 7
MAX_WORKERS = 20
MAX_SNAPSHOT_BYTES = 80 * 1024 * 1024
RETENTION_SECONDS = 365 * 86400
RANGES = {
    "24h": (86400, 300),
    "7d": (7 * 86400, 900),
    "30d": (30 * 86400, 3600),
    "365d": (365 * 86400, 86400),
}
USER_AGENT = (
    "MAKAKAIglitch-ServiceStatus/2.0 "
    "(+https://makakaiglitch.github.io/tools/service-status/)"
)
PAGES_BASE_URL = os.environ.get(
    "SERVICE_STATUS_PAGES_URL", "https://makakaiglitch.github.io"
).rstrip("/")
SNAPSHOT_URL = f"{PAGES_BASE_URL}/data/service-status-state.json"


def clean_text(value: Any, limit: int = 240) -> str | None:
    if value is None:
        return None
    result = re.sub(r"[\x00-\x1f\x7f]", " ", str(value))
    result = re.sub(r"\s+", " ", result).strip()
    return result[:limit] or None


def load_catalog() -> list[dict[str, Any]]:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(catalog, list) or not catalog:
        raise RuntimeError("The service catalog is empty or invalid.")
    ids = [item.get("id") for item in catalog]
    if any(not service_id for service_id in ids) or len(ids) != len(set(ids)):
        raise RuntimeError("The service catalog contains missing or duplicate IDs.")
    for item in catalog:
        for field in ("probe_url", "website"):
            parts = urlsplit(str(item.get(field) or ""))
            if parts.scheme != "https" or not parts.netloc:
                raise RuntimeError(
                    f"Service {item['id']} has an invalid HTTPS {field}."
                )
        status_url = item.get("status_api_url")
        if status_url:
            parts = urlsplit(str(status_url))
            if parts.scheme != "https" or not parts.netloc:
                raise RuntimeError(
                    f"Service {item['id']} has an invalid HTTPS status_api_url."
                )
    return catalog

def open_request(url: str, timeout: int, accept: str):
    request = Request(
        url,
        headers={
            "Accept": accept,
            "Cache-Control": "no-cache",
            "User-Agent": USER_AGENT,
        },
        method="GET",
    )
    started = time.perf_counter()
    try:
        response = urlopen(request, timeout=timeout)
        status = int(response.status)
        response.close()
        return status, max(0, round((time.perf_counter() - started) * 1000)), None
    except HTTPError as error:
        status = int(error.code)
        error.close()
        return status, max(0, round((time.perf_counter() - started) * 1000)), None
    except (TimeoutError, socket.timeout):
        return None, None, "TIMEOUT"
    except URLError as error:
        reason = getattr(error, "reason", None)
        code = "TIMEOUT" if isinstance(reason, (TimeoutError, socket.timeout)) else "NETWORK_ERROR"
        return None, None, code
    except Exception:
        return None, None, "NETWORK_ERROR"


def fetch_probe(service: dict[str, Any]) -> dict[str, Any]:
    status, latency, error_code = open_request(
        service["probe_url"],
        PROBE_TIMEOUT_SECONDS,
        "text/html,application/json,text/plain,*/*",
    )
    reachable = status is not None and status < 500
    if status is not None and status >= 400:
        error_code = f"HTTP_{status}"
    return {
        "reachable": reachable,
        "latency_ms": latency,
        "http_status": status,
        "error_code": error_code,
    }


def fetch_status_api(service: dict[str, Any]) -> dict[str, Any]:
    url = service.get("status_api_url")
    if not url:
        return {"available": False, "indicator": None, "summary": None}
    request = Request(
        url,
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
        method="GET",
    )
    try:
        with urlopen(request, timeout=STATUS_TIMEOUT_SECONDS) as response:
            if not 200 <= int(response.status) < 300:
                return {"available": False, "indicator": None, "summary": None}
            raw = response.read(1024 * 1024 + 1)
        if len(raw) > 1024 * 1024:
            return {"available": False, "indicator": None, "summary": None}
        data = json.loads(raw.decode("utf-8"))
        status = data.get("status") if isinstance(data, dict) else {}
        status = status if isinstance(status, dict) else {}
        return {
            "available": True,
            "indicator": (clean_text(status.get("indicator"), 48) or "unknown").lower(),
            "summary": clean_text(status.get("description"), 240),
        }
    except Exception:
        return {"available": False, "indicator": None, "summary": None}


def health_from(probe: dict[str, Any], status_page: dict[str, Any]) -> str:
    if not probe["reachable"]:
        return "outage"
    indicator = str(status_page.get("indicator") or "").lower()
    if "maintenance" in indicator:
        return "maintenance"
    if any(word in indicator for word in ("critical", "major", "outage")):
        return "outage"
    if any(word in indicator for word in ("minor", "degraded")):
        return "degraded"
    if (probe["http_status"] or 0) >= 400:
        return "degraded"
    return "operational"


def check_service(service: dict[str, Any]) -> dict[str, Any]:
    probe = fetch_probe(service)
    status_page = fetch_status_api(service)
    health = health_from(probe, status_page)
    return {
        "service": service,
        "checked_at": None,
        "latency_ms": probe["latency_ms"],
        "http_status": probe["http_status"],
        "up": bool(probe["reachable"] and health != "outage"),
        "error_code": probe["error_code"],
        "health_status": health,
        "status_indicator": status_page["indicator"],
        "status_summary": status_page["summary"],
        "status_api_available": bool(status_page["available"]),
    }


def empty_snapshot() -> dict[str, Any]:
    return {
        "schema_version": 1,
        "generated_at": None,
        "last_check_at": None,
        "interval_seconds": INTERVAL_SECONDS,
        "retention_days": 365,
        "detailed_ranges": ["24h", "7d", "30d"],
        "monitoring_location": "GitHub Actions hosted runner; single vantage point",
        "services": [],
        "incidents": [],
        "states": {},
        "history": {},
    }


def load_previous_snapshot() -> dict[str, Any]:
    if STATE_PATH.exists():
        try:
            data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                print("Loaded previous snapshot from the workspace.")
                return data
        except (OSError, json.JSONDecodeError):
            print("Workspace snapshot is invalid; trying the published copy.")

    url = SNAPSHOT_URL + "?" + urlencode({"nocache": str(time.time_ns())})
    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
            "User-Agent": USER_AGENT,
            "Accept-Encoding": "gzip",
        },
        method="GET",
    )
    try:
        with urlopen(request, timeout=20) as response:
            raw = response.read(MAX_SNAPSHOT_BYTES + 1)
            if response.headers.get("Content-Encoding", "").lower() == "gzip":
                raw = gzip.decompress(raw)
        if len(raw) > MAX_SNAPSHOT_BYTES:
            raise RuntimeError("The previously published snapshot is too large.")
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict) or data.get("schema_version") != 1:
            raise RuntimeError("The published snapshot has an unsupported schema.")
        print(
            "Loaded published history:",
            f"{len(data.get('services', []))} services,",
            f"{len(data.get('incidents', []))} incidents.",
        )
        return data
    except HTTPError as error:
        if error.code == 404:
            print("No published history yet; starting a new snapshot.")
            return empty_snapshot()
        raise RuntimeError(
            f"Could not read the previous Pages snapshot (HTTP {error.code}); "
            "refusing to overwrite history with an empty file."
        ) from error
    except (URLError, TimeoutError, socket.timeout, json.JSONDecodeError) as error:
        raise RuntimeError(
            f"Could not safely load the previous Pages snapshot: {error}"
        ) from error


def ensure_service_history(history: dict[str, Any], service_id: str) -> dict[str, Any]:
    value = history.get(service_id)
    if not isinstance(value, dict):
        value = {}
        history[service_id] = value
    for range_name in RANGES:
        points = value.get(range_name)
        if not isinstance(points, list):
            value[range_name] = []
    return value


def append_bucket(
    points: list[list[Any]],
    timestamp: int,
    bucket_seconds: int,
    window_seconds: int,
    result: dict[str, Any],
) -> None:
    bucket_at = (timestamp // bucket_seconds) * bucket_seconds
    bucket = None
    for point in reversed(points):
        if int(point[0]) == bucket_at:
            bucket = point
            break
        if int(point[0]) < bucket_at:
            break
    if bucket is None:
        bucket = [bucket_at, 0, 0, 0, 0, None, None]
        points.append(bucket)
    bucket[1] = int(bucket[1]) + 1
    if result["up"]:
        bucket[2] = int(bucket[2]) + 1
    latency = result["latency_ms"]
    if latency is not None:
        latency = int(latency)
        bucket[3] = int(bucket[3]) + latency
        bucket[4] = int(bucket[4]) + 1
        bucket[5] = latency if bucket[5] is None else min(int(bucket[5]), latency)
        bucket[6] = latency if bucket[6] is None else max(int(bucket[6]), latency)
    cutoff = timestamp - window_seconds
    points[:] = [point for point in points if int(point[0]) >= cutoff]
    points.sort(key=lambda point: int(point[0]))


def incident_message(result: dict[str, Any]) -> str:
    code = result.get("error_code")
    if code and str(code).startswith("HTTP_"):
        return f"Проверочный endpoint вернул {str(code).replace('_', ' ')}."
    if code:
        return f"Проверочный endpoint не ответил: {code}."
    if result.get("status_summary"):
        return str(result["status_summary"])[:400]
    if result.get("health_status") == "maintenance":
        return "Официальная status page сообщает о технических работах."
    return "Состояние сервиса отличается от нормального."


def update_incidents(
    data: dict[str, Any], result: dict[str, Any], timestamp: int
) -> None:
    service_id = result["service"]["id"]
    states = data.setdefault("states", {})
    previous = states.get(service_id) or {}
    previous_bad = int(previous.get("consecutive_bad") or 0)
    previous_good = int(previous.get("consecutive_good") or 0)
    incident_id = previous.get("current_incident_id")
    is_bad = result["health_status"] != "operational"
    next_bad = previous_bad + 1 if is_bad else 0
    next_good = 0 if is_bad else previous_good + 1
    incidents = data.setdefault("incidents", [])

    if is_bad and next_bad >= 2 and not incident_id:
        incident_id = str(uuid.uuid4())
        health = result["health_status"]
        severity = "major" if health == "outage" else (
            "maintenance" if health == "maintenance" else "minor"
        )
        incidents.append({
            "id": incident_id,
            "service_id": service_id,
            "started_at": timestamp,
            "ended_at": None,
            "severity": severity,
            "message": incident_message(result),
            "source": "probe+status_api" if result["status_api_available"] else "http_probe",
        })
    elif not is_bad and incident_id and next_good >= 2:
        for incident in reversed(incidents):
            if incident.get("id") == incident_id and incident.get("ended_at") is None:
                incident["ended_at"] = timestamp
                break
        incident_id = None

    states[service_id] = {
        "consecutive_bad": next_bad,
        "consecutive_good": next_good,
        "current_incident_id": incident_id,
        "last_status": result["health_status"],
        "updated_at": timestamp,
    }


def summarize_history(points: list[list[Any]]) -> dict[str, Any]:
    checks = sum(int(point[1]) for point in points)
    successful = sum(int(point[2]) for point in points)
    latency_sum = sum(int(point[3]) for point in points)
    latency_samples = sum(int(point[4]) for point in points)
    return {
        "checks": checks,
        "successful": successful,
        "uptime_pct": round(successful * 100 / checks, 3) if checks else None,
        "avg_latency_ms": round(latency_sum / latency_samples, 2) if latency_samples else None,
    }


def build_snapshot(
    catalog: list[dict[str, Any]],
    results: list[dict[str, Any]],
    previous: dict[str, Any],
    checked_at: int,
) -> dict[str, Any]:
    data = previous if isinstance(previous, dict) else empty_snapshot()
    data.setdefault("schema_version", 1)
    data["interval_seconds"] = INTERVAL_SECONDS
    data["retention_days"] = 365
    data["monitoring_location"] = "GitHub Actions hosted runner; single vantage point"
    data["generated_at"] = int(time.time())
    data["last_check_at"] = checked_at
    data["incidents"] = data.get("incidents") if isinstance(data.get("incidents"), list) else []
    data["states"] = data.get("states") if isinstance(data.get("states"), dict) else {}
    data["history"] = data.get("history") if isinstance(data.get("history"), dict) else {}

    by_id = {result["service"]["id"]: result for result in results}
    services: list[dict[str, Any]] = []

    for service in catalog:
        service_id = service["id"]
        result = by_id[service_id]
        result["checked_at"] = checked_at
        update_incidents(data, result, checked_at)

        history = ensure_service_history(data["history"], service_id)
        for range_name, (window_seconds, bucket_seconds) in RANGES.items():
            append_bucket(
                history[range_name],
                checked_at,
                bucket_seconds,
                window_seconds,
                result,
            )

        recent = history["24h"]
        recent_summary = summarize_history(recent)
        active_incidents = sum(
            1 for incident in data["incidents"]
            if incident.get("service_id") == service_id and incident.get("ended_at") is None
        )
        services.append({
            "id": service_id,
            "name": service.get("name", service_id),
            "category": service.get("category", "platform"),
            "symbol": service.get("symbol", service.get("name", service_id)[:2]),
            "description": service.get("description", ""),
            "website": service.get("website"),
            "status_page_url": service.get("status_page_url"),
            "status": result["health_status"],
            "latest": {
                "checked_at": checked_at,
                "latency_ms": result["latency_ms"],
                "http_status": result["http_status"],
                "up": bool(result["up"]),
                "error_code": result["error_code"],
                "health_status": result["health_status"],
                "status_indicator": result["status_indicator"],
                "status_summary": result["status_summary"],
                "status_api_available": bool(result["status_api_available"]),
            },
            "uptime_24h": recent_summary["uptime_pct"],
            "checks_24h": recent_summary["checks"],
            "active_incidents": active_incidents,
        })

    retention_cutoff = checked_at - RETENTION_SECONDS
    data["incidents"] = [
        incident for incident in data["incidents"]
        if incident.get("ended_at") is None
        or int(incident.get("started_at") or 0) >= retention_cutoff
    ]
    current_ids = {service["id"] for service in catalog}
    data["history"] = {
        service_id: value
        for service_id, value in data["history"].items()
        if service_id in current_ids
    }
    data["states"] = {
        service_id: value
        for service_id, value in data["states"].items()
        if service_id in current_ids
    }
    data["services"] = services
    data["summary"] = {
        "service_count": len(services),
        "operational": sum(1 for service in services if service["status"] == "operational"),
        "degraded": sum(1 for service in services if service["status"] == "degraded"),
        "outage": sum(1 for service in services if service["status"] == "outage"),
        "active_incidents": sum(
            1 for incident in data["incidents"] if incident.get("ended_at") is None
        ),
    }
    return data


def self_test() -> None:
    catalog = [{
        "id": "example", "name": "Example", "category": "platform",
        "symbol": "EX", "description": "Self-test", "website": "https://example.com/",
        "probe_url": "https://example.com/", "status_api_url": None,
        "status_page_url": None,
    }]
    data = empty_snapshot()
    base_time = 1_800_000_000
    healthy = {
        "service": catalog[0], "checked_at": base_time, "latency_ms": 120,
        "http_status": 200, "up": True, "error_code": None,
        "health_status": "operational", "status_indicator": None,
        "status_summary": None, "status_api_available": False,
    }
    first = build_snapshot(catalog, [healthy.copy()], data, base_time)
    assert first["services"][0]["status"] == "operational"
    assert first["services"][0]["uptime_24h"] == 100
    assert first["history"]["example"]["24h"][0][1:5] == [1, 1, 120, 1]

    unhealthy = {
        **healthy, "latency_ms": None, "http_status": None, "up": False,
        "error_code": "TIMEOUT", "health_status": "outage",
    }
    second = build_snapshot(catalog, [unhealthy.copy()], first, base_time + 300)
    assert second["summary"]["active_incidents"] == 0
    assert not second["incidents"]

    third = build_snapshot(catalog, [unhealthy.copy()], second, base_time + 600)
    assert third["summary"]["active_incidents"] == 1
    assert third["incidents"][0]["severity"] == "major"

    fourth = build_snapshot(catalog, [healthy.copy()], third, base_time + 900)
    assert fourth["summary"]["active_incidents"] == 1
    fifth = build_snapshot(catalog, [healthy.copy()], fourth, base_time + 1200)
    assert fifth["summary"]["active_incidents"] == 0
    assert fifth["incidents"][0]["ended_at"] == base_time + 1200

    status_major = {"indicator": "major_outage"}
    assert health_from(
        {"reachable": True, "http_status": 200}, status_major
    ) == "outage"
    print("Service Status collector self-test: PASS")


def main() -> int:
    parser = argparse.ArgumentParser(description="Collect Service Status measurements.")
    parser.add_argument("--self-test", action="store_true", help="Run offline tests.")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return 0

    catalog = load_catalog()
    previous = load_previous_snapshot()
    checked_at = int(time.time())
    print(f"Checking {len(catalog)} services from a GitHub Actions runner...")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(check_service, catalog))

    snapshot = build_snapshot(catalog, results, previous, checked_at)
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    state_temp = STATE_PATH.with_suffix(".json.tmp")
    state_temp.write_text(
        json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    state_temp.replace(STATE_PATH)

    public_snapshot = {
        key: snapshot[key]
        for key in (
            "schema_version", "generated_at", "last_check_at", "interval_seconds",
            "retention_days", "monitoring_location", "services", "incidents", "summary",
        )
    }
    summary_temp = SUMMARY_PATH.with_suffix(".json.tmp")
    summary_temp.write_text(
        json.dumps(public_snapshot, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    summary_temp.replace(SUMMARY_PATH)

    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    for service_id, ranges in snapshot["history"].items():
        history_temp = HISTORY_DIR / (service_id + ".json.tmp")
        history_path = HISTORY_DIR / (service_id + ".json")
        history_temp.write_text(
            json.dumps(
                {"service_id": service_id, "generated_at": snapshot["generated_at"], "history": ranges},
                separators=(",", ":"),
            ) + "\n",
            encoding="utf-8",
        )
        history_temp.replace(history_path)

    size_mb = STATE_PATH.stat().st_size / (1024 * 1024)
    summary = snapshot["summary"]
    print(
        "Snapshot saved:",
        f"{summary['service_count']} services;",
        f"{summary['operational']} operational;",
        f"{summary['degraded']} degraded;",
        f"{summary['outage']} outage;",
        f"{summary['active_incidents']} active incidents;",
        f"{size_mb:.2f} MiB.",
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Service Status collector failed: {error}", file=sys.stderr)
        raise

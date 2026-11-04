#!/usr/bin/env python3
"""Fetch official Gaijin torrent metadata and scrape public tracker counts.

This job only asks trackers for scrape statistics. It does not download payload
pieces, announce as a peer, seed, or modify the torrent files.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import ipaddress
import json
import os
import random
import re
import socket
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

USER_AGENT = "MAKAKAIglitch-TorrentStats/1.0 (+https://makakaiglitch.github.io/library/torrent/shares/)"
REQUEST_TIMEOUT = 7
MAX_TORRENT_BYTES = 20 * 1024 * 1024
MAX_TRACKERS_PER_TORRENT = 30
MAX_WORKERS = 10

GAMES = (
    {
        "id": "war-thunder",
        "name": "War Thunder",
        "project": "warthunder",
        "url": "https://yupmaster.gaijinent.com/yuitem/current_yup.php?project=warthunder&torrent=1",
    },
    {
        "id": "enlisted",
        "name": "Enlisted",
        "project": "enlisted",
        "url": "https://yupmaster.gaijinent.com/yuitem/current_yup.php?project=enlisted&torrent=1",
    },
)


class TorrentDataError(Exception):
    pass


def bdecode(data: bytes, pos: int = 0, depth: int = 0):
    """Decode one bencoded value and return (value, next_pos, dict_value_spans)."""
    if depth > 80:
        raise TorrentDataError("Bencode nesting limit exceeded")
    if pos >= len(data):
        raise TorrentDataError("Unexpected end of bencoded data")

    marker = data[pos : pos + 1]

    if marker == b"i":
        end = data.find(b"e", pos + 1)
        if end < 0:
            raise TorrentDataError("Unterminated bencode integer")
        raw = data[pos + 1 : end]
        if not raw or not re.fullmatch(rb"-?(0|[1-9][0-9]*)", raw):
            raise TorrentDataError("Invalid bencode integer")
        return int(raw), end + 1, None

    if marker == b"l":
        items = []
        pos += 1
        while True:
            if pos >= len(data):
                raise TorrentDataError("Unterminated bencode list")
            if data[pos : pos + 1] == b"e":
                return items, pos + 1, None
            value, pos, _ = bdecode(data, pos, depth + 1)
            items.append(value)

    if marker == b"d":
        result = {}
        spans = {}
        pos += 1
        while True:
            if pos >= len(data):
                raise TorrentDataError("Unterminated bencode dictionary")
            if data[pos : pos + 1] == b"e":
                return result, pos + 1, spans
            key, pos, _ = bdecode(data, pos, depth + 1)
            if not isinstance(key, bytes):
                raise TorrentDataError("Bencode dictionary key is not a byte string")
            value_start = pos
            value, pos, _ = bdecode(data, pos, depth + 1)
            result[key] = value
            spans[key] = (value_start, pos)

    if marker.isdigit():
        colon = data.find(b":", pos)
        if colon < 0:
            raise TorrentDataError("Invalid bencode byte string")
        length_raw = data[pos:colon]
        if not length_raw or not length_raw.isdigit() or (len(length_raw) > 1 and length_raw.startswith(b"0")):
            raise TorrentDataError("Invalid bencode byte string length")
        length = int(length_raw)
        start = colon + 1
        end = start + length
        if end > len(data):
            raise TorrentDataError("Truncated bencode byte string")
        return data[start:end], end, None

    raise TorrentDataError("Unknown bencode marker")


def decode_torrent(data: bytes) -> dict[str, Any]:
    if not data or len(data) > MAX_TORRENT_BYTES:
        raise TorrentDataError("Torrent file is empty or exceeds the size limit")

    metadata, end, spans = bdecode(data)
    if end != len(data) or not isinstance(metadata, dict):
        raise TorrentDataError("Torrent file has an invalid top-level structure")

    info = metadata.get(b"info")
    if not isinstance(info, dict) or spans is None or b"info" not in spans:
        raise TorrentDataError("Torrent file has no valid info dictionary")

    start, stop = spans[b"info"]
    info_hash = hashlib.sha1(data[start:stop]).hexdigest()

    name_bytes = info.get(b"name.utf-8") or info.get(b"name")
    if isinstance(name_bytes, bytes):
        name = name_bytes.decode("utf-8", errors="replace").strip()
    else:
        name = "Unknown torrent"

    trackers: list[str] = []
    announce_list = metadata.get(b"announce-list")
    if isinstance(announce_list, list):
        for tier in announce_list:
            candidates = tier if isinstance(tier, list) else [tier]
            for candidate in candidates:
                if isinstance(candidate, bytes):
                    trackers.append(candidate.decode("utf-8", errors="replace").strip())

    announce = metadata.get(b"announce")
    if isinstance(announce, bytes):
        trackers.append(announce.decode("utf-8", errors="replace").strip())

    unique_trackers = []
    seen = set()
    for tracker in trackers:
        if tracker and tracker not in seen:
            seen.add(tracker)
            unique_trackers.append(tracker)

    return {
        "name": name or "Unknown torrent",
        "info_hash": info_hash,
        "trackers": unique_trackers[:MAX_TRACKERS_PER_TORRENT],
    }


def fetch_torrent(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/x-bittorrent, application/octet-stream, */*"})
    with urllib.request.urlopen(request, timeout=25) as response:
        data = response.read(MAX_TORRENT_BYTES + 1)
    if len(data) > MAX_TORRENT_BYTES:
        raise TorrentDataError("Gaijin torrent response exceeds the size limit")
    return data


def validate_tracker_url(raw_url: str):
    parts = urllib.parse.urlsplit(raw_url)
    scheme = parts.scheme.lower()
    if scheme not in {"http", "https", "udp"} or not parts.hostname:
        raise ValueError("Unsupported tracker URL")
    host = parts.hostname.rstrip(".").lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith((".local", ".internal", ".localhost")):
        raise ValueError("Local tracker hosts are not allowed")
    try:
        address = ipaddress.ip_address(host)
        if not address.is_global:
            raise ValueError("Non-public tracker address")
    except ValueError as error:
        if "Non-public" in str(error):
            raise
    return parts


def decode_scrape_response(body: bytes, info_hash: bytes):
    decoded, end, _ = bdecode(body)
    if end != len(body) or not isinstance(decoded, dict):
        raise ValueError("Invalid tracker scrape response")
    files = decoded.get(b"files")
    if not isinstance(files, dict):
        raise ValueError("Tracker response does not contain scrape data")
    record = files.get(info_hash)
    if not isinstance(record, dict):
        raise ValueError("Tracker did not return this info hash")
    complete = record.get(b"complete")
    incomplete = record.get(b"incomplete")
    if not isinstance(complete, int) or not isinstance(incomplete, int) or complete < 0 or incomplete < 0:
        raise ValueError("Tracker returned invalid peer counts")
    return {"seeders": complete, "leechers": incomplete}


def scrape_http(tracker_url: str, info_hash: bytes):
    parts = validate_tracker_url(tracker_url)
    if "announce" not in parts.path.lower():
        raise ValueError("HTTP tracker URL has no announce endpoint")
    path = re.sub("announce", "scrape", parts.path, count=1, flags=re.IGNORECASE)
    query = parts.query + ("&" if parts.query else "") + "info_hash=" + urllib.parse.quote_from_bytes(info_hash, safe="")
    scrape_url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, path, query, ""))

    request = urllib.request.Request(
        scrape_url,
        headers={"User-Agent": USER_AGENT, "Accept": "text/plain, application/octet-stream, */*"},
    )
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as response:
        body = response.read(1024 * 1024)
    return decode_scrape_response(body, info_hash)


def scrape_udp(tracker_url: str, info_hash: bytes):
    parts = validate_tracker_url(tracker_url)
    port = parts.port or 80
    addresses = socket.getaddrinfo(parts.hostname, port, type=socket.SOCK_DGRAM)
    if not addresses:
        raise OSError("Tracker hostname did not resolve")

    family, socktype, proto, _, sockaddr = addresses[0]
    with socket.socket(family, socktype, proto) as sock:
        sock.settimeout(REQUEST_TIMEOUT)

        transaction = random.getrandbits(32)
        connect_request = struct.pack(">QII", 0x41727101980, 0, transaction)
        sock.sendto(connect_request, sockaddr)
        connect_response, _ = sock.recvfrom(4096)
        if len(connect_response) < 16:
            raise ValueError("Short UDP tracker connect response")

        action, response_transaction = struct.unpack(">II", connect_response[:8])
        if action != 0 or response_transaction != transaction:
            raise ValueError("Unexpected UDP tracker connect response")
        connection_id = connect_response[8:16]

        transaction = random.getrandbits(32)
        scrape_request = connection_id + struct.pack(">II", 2, transaction) + info_hash
        sock.sendto(scrape_request, sockaddr)
        scrape_response, _ = sock.recvfrom(4096)

        if len(scrape_response) < 20:
            raise ValueError("Short UDP tracker scrape response")
        action, response_transaction = struct.unpack(">II", scrape_response[:8])
        if action != 2 or response_transaction != transaction:
            raise ValueError("Unexpected UDP tracker scrape response")

        complete, _downloaded, incomplete = struct.unpack(">III", scrape_response[8:20])
        return {"seeders": complete, "leechers": incomplete}


def scrape_one(tracker_url: str, info_hash_hex: str):
    info_hash = bytes.fromhex(info_hash_hex)
    try:
        parts = validate_tracker_url(tracker_url)
        if parts.scheme.lower() == "udp":
            stats = scrape_udp(tracker_url, info_hash)
        else:
            stats = scrape_http(tracker_url, info_hash)
        return {
            "tracker": tracker_url,
            "seeders": stats["seeders"],
            "leechers": stats["leechers"],
        }, None
    except Exception as error:  # A dead tracker must not fail the whole job.
        return None, f"{tracker_url}: {type(error).__name__}: {error}"


def collect_tracker_stats(trackers: list[str], info_hash: str):
    if not trackers:
        return [], ["Torrent has no announce trackers"]

    results = []
    errors = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(trackers))) as executor:
        futures = [executor.submit(scrape_one, tracker, info_hash) for tracker in trackers]
        for future in concurrent.futures.as_completed(futures):
            result, error = future.result()
            if result is not None:
                results.append(result)
            elif error:
                errors.append(error)

    # Trackers can report overlapping views of the same swarm. Use the single
    # largest successful scrape instead of adding their counts and double-counting peers.
    results.sort(key=lambda item: (item["seeders"] + item["leechers"], item["seeders"]), reverse=True)
    return results, errors


def utc_now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def previous_game(previous: dict[str, Any], game_id: str):
    games = previous.get("games", {}) if isinstance(previous, dict) else {}
    value = games.get(game_id, {}) if isinstance(games, dict) else {}
    return value if isinstance(value, dict) else {}


def collect_game(game: dict[str, str], previous: dict[str, Any], checked_at: str):
    old = previous_game(previous, game["id"])
    base = {
        "id": game["id"],
        "name": game["name"],
        "project": game["project"],
        "torrent_url": game["url"],
        "checked_at": checked_at,
        "info_hash": old.get("info_hash"),
        "seeders": old.get("seeders"),
        "leechers": old.get("leechers"),
        "source_tracker": old.get("source_tracker"),
        "trackers_responded": 0,
        "trackers_total": 0,
        "status": "unavailable",
        "last_success_at": old.get("last_success_at"),
        "error": None,
    }

    try:
        torrent = decode_torrent(fetch_torrent(game["url"]))
        base["info_hash"] = torrent["info_hash"]
        base["torrent_name"] = torrent["name"]
        base["trackers_total"] = len(torrent["trackers"])
        results, errors = collect_tracker_stats(torrent["trackers"], torrent["info_hash"])
        base["trackers_responded"] = len(results)

        if results:
            best = results[0]
            base.update({
                "seeders": best["seeders"],
                "leechers": best["leechers"],
                "source_tracker": best["tracker"],
                "status": "ok",
                "last_success_at": checked_at,
                "error": None,
            })
        elif old.get("info_hash") == torrent["info_hash"] and old.get("seeders") is not None and old.get("leechers") is not None:
            # Keep the last confirmed numbers during temporary tracker outages.
            base["status"] = "stale"
            base["error"] = "No tracker returned a fresh scrape; showing the last successful sample."
        else:
            # Never carry counts across a torrent update: the new info hash
            # represents a different swarm and needs its own scrape results.
            base["seeders"] = None
            base["leechers"] = None
            base["source_tracker"] = None
            base["last_success_at"] = None
            base["error"] = "No tracker returned scrape statistics for this info hash."

        if errors:
            base["tracker_errors"] = errors[:8]
        return base

    except Exception as error:
        base["status"] = "stale" if old.get("seeders") is not None and old.get("leechers") is not None else "unavailable"
        base["error"] = f"{type(error).__name__}: {error}"
        return base


def run(output_path: Path):
    previous = {}
    if output_path.exists():
        try:
            previous = json.loads(output_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = {}

    checked_at = utc_now()
    games = {}
    for game in GAMES:
        result = collect_game(game, previous, checked_at)
        games[game["id"]] = result
        if result["seeders"] is None or result["leechers"] is None:
            print(f'{game["name"]}: swarm stats unavailable ({result["error"]})')
            print(
                f'  info hash: {result.get("info_hash") or "unknown"}; '
                f'trackers: {result["trackers_responded"]}/{result["trackers_total"]}'
            )
            for tracker_error in result.get("tracker_errors", [])[:6]:
                print(f"  tracker error: {tracker_error}")
        else:
            print(
                f'{game["name"]}: {result["seeders"]} seeders / '
                f'{result["leechers"]} leechers ({result["status"]}, '
                f'{result["trackers_responded"]}/{result["trackers_total"]} trackers)'
            )

    document = {
        "schema_version": 1,
        "generated_at": checked_at,
        "refresh_minutes": 15,
        "sort_default": "leechers",
        "games": games,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = output_path.with_suffix(output_path.suffix + ".tmp")
    temp_path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temp_path.replace(output_path)


def self_test():
    def encode(value):
        if isinstance(value, bytes):
            return str(len(value)).encode("ascii") + b":" + value
        if isinstance(value, int):
            return b"i" + str(value).encode("ascii") + b"e"
        if isinstance(value, list):
            return b"l" + b"".join(encode(item) for item in value) + b"e"
        if isinstance(value, dict):
            return b"d" + b"".join(encode(key) + encode(value[key]) for key in sorted(value)) + b"e"
        raise TypeError(type(value))

    info = {
        b"name": b"MAKAKAIglitch test torrent",
        b"piece length": 16384,
        b"pieces": b"0" * 20,
        b"length": 0,
    }
    payload = encode({
        b"announce": b"udp://tracker.example.org:1337/announce",
        b"announce-list": [[b"udp://tracker.example.org:1337/announce"], [b"https://tracker.example.org/announce"]],
        b"info": info,
    })
    decoded = decode_torrent(payload)
    assert decoded["name"] == "MAKAKAIglitch test torrent"
    assert len(decoded["info_hash"]) == 40
    assert len(decoded["trackers"]) == 2
    assert decoded["info_hash"] == hashlib.sha1(encode(info)).hexdigest()
    assert bdecode(encode({b"a": 1, b"b": [b"x", 2]}))[0] == {b"a": 1, b"b": [b"x", 2]}

    # Exercise stale-data handling without making a network request.
    global fetch_torrent, collect_tracker_stats
    original_fetch_torrent = fetch_torrent
    original_collect_tracker_stats = collect_tracker_stats
    try:
        fetch_torrent = lambda _url: payload
        collect_tracker_stats = lambda _trackers, _info_hash: ([], ["test tracker offline"])

        old_hash = "a" * 40
        previous = {"games": {"war-thunder": {
            "info_hash": old_hash, "seeders": 123, "leechers": 45,
            "source_tracker": "udp://old.example/announce",
            "last_success_at": "2026-01-01T00:00:00Z",
        }}}
        changed_hash = collect_game(GAMES[0], previous, "2026-01-01T00:15:00Z")
        assert changed_hash["info_hash"] != old_hash
        assert changed_hash["seeders"] is None and changed_hash["leechers"] is None
        assert changed_hash["source_tracker"] is None
        assert changed_hash["status"] == "unavailable"

        same_previous = {"games": {"war-thunder": {
            "info_hash": decoded["info_hash"], "seeders": 12, "leechers": 5,
            "source_tracker": "udp://old.example/announce",
            "last_success_at": "2026-01-01T00:00:00Z",
        }}}
        stale_same_hash = collect_game(GAMES[0], same_previous, "2026-01-01T00:15:00Z")
        assert stale_same_hash["seeders"] == 12 and stale_same_hash["leechers"] == 5
        assert stale_same_hash["status"] == "stale"
    finally:
        fetch_torrent = original_fetch_torrent
        collect_tracker_stats = original_collect_tracker_stats

    print("Torrent stats collector self-test passed.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="data/torrent-stats.json", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        self_test()
        return 0

    run(args.output)
    return 0


if __name__ == "__main__":
    sys.exit(main())

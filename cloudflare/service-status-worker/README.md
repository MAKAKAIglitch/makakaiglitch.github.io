# Service Status Monitor — Cloudflare Worker

This Worker powers the Service Status page at `/tools/service-status/`.

## What it monitors

The fixed service catalog contains Telegram, YouTube, Google, Cloudflare, GitHub, Discord, OpenAI, Steam, NextDNS, Reddit, X, Twitch, Spotify, Wikipedia, WhatsApp and Microsoft.

Every five minutes the Worker:
1. Sends an HTTPS request to a known endpoint for each service.
2. Reads official Statuspage API summaries for Cloudflare, GitHub, Discord and OpenAI.
3. Stores the timestamp, response latency, HTTP code, reachability and status indicator in D1.
4. Opens an incident after two consecutive non-operational checks and resolves it after two consecutive operational checks.

The Worker does not accept arbitrary probe URLs, so it cannot be used as an open URL-fetch proxy. Its public API is read-only.

## Deploy

You need a Cloudflare account with Workers and D1 enabled, and Node.js/npm available on your computer.

From this directory:

First create a D1 database in the Cloudflare dashboard (Workers & Pages → Storage & databases → D1). Name it exactly `makakaiglitch-service-status`. Copy its database ID.

Then, from this directory, log in and replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with the ID shown in the dashboard:

```sh
npx wrangler@latest login
```

Apply the schema to the remote database:

```sh
npx wrangler@latest d1 execute makakaiglitch-service-status --remote --file=./schema.sql
```

Deploy the Worker:

```sh
npx wrangler@latest deploy
```

Wrangler prints a `workers.dev` URL. Open the site at `/tools/service-status/`, choose **Settings**, paste that URL into **Cloudflare Worker API URL**, then save and connect.

The first scheduled measurement runs on the next five-minute Cron interval. The API becomes useful as soon as the first checks have been stored; charts and uptime percentages fill in over time.

## Local test

The configured Cron handler can be tested locally with Wrangler:

```sh
npx wrangler@latest dev --test-scheduled
```

In another terminal, invoke the local scheduled route shown by Wrangler, usually:

```sh
curl "http://localhost:8787/cdn-cgi/local/scheduled?format=json"
```

For a deployed Worker, verify:

```sh
curl "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/health"
curl "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/services"
curl "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/history?service=telegram&range=24h"
```

## API

- `GET /api/health` — monitoring settings and last check time.
- `GET /api/services` — service catalog and latest measurements.
- `GET /api/history?service=telegram&range=24h` — combined latency and availability history. Supported ranges: `24h`, `7d`, `30d`, `90d`, `365d`.
- `GET /api/incidents?days=30` — detected incidents. Supported windows: 7, 30, 90 and 365 days.

All endpoints are read-only and return JSON with permissive CORS for the static GitHub Pages frontend. No visitor IP address, account identifier or personal browsing data is stored by this Worker.

## Sampling and storage

- Sampling interval: 5 minutes.
- One service produces up to 288 samples/day and 105,120 samples/year.
- 16 services produce up to 4,608 samples/day and 1,681,920 samples/year.
- Probe history and resolved incidents older than 365 days are removed by a daily cleanup run.
- History buckets are downsampled for charts: 5 minutes (24h), 15 minutes (7d), 1 hour (30d), 6 hours (90d), and 1 day (365d).
- The API reports both measured uptime and monitoring coverage. Missing Cron runs are not silently counted as successful checks.

Cloudflare plan limits and storage quotas can change. Check your D1 and Workers usage in the Cloudflare dashboard. The current D1 Free database-size limit is 500 MB; actual storage depends on SQLite row and index overhead. This configuration is sized for a compact one-year sample history, but monitor database usage as history accumulates.

## Measurement notes

- Latency is HTTP response time measured by the Worker until response headers arrive. It is not ICMP ping/RTT.
- A 2xx/3xx response is reachable. A 4xx response is recorded as degraded/reachable; network errors, timeouts and 5xx responses are treated as unavailable.
- Official status APIs are supplementary. A missing official API response does not automatically mark a service down.
- Checks run from the Cloudflare Worker execution region. This is one monitoring vantage point, not a global probe network and not a measurement from the visitor's ISP, home router or device.
- Some services can rate-limit or block automated requests. In those cases the recorded HTTP code and endpoint may need review.
- Uptime means monitored HTTP availability combined with official major-outage state where available; it is not a guarantee that every feature of a service works.

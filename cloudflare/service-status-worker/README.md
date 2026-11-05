# Service Status Monitor — legacy Cloudflare Worker

> **This is no longer the active backend for the public monitor.** The live page at
> [Service Status](/tools/service-status/) now uses GitHub Actions and GitHub Pages.
> No Cloudflare Worker or D1 database is required for the active setup.

## Active GitHub Actions architecture

- The scheduled workflow is `.github/workflows/deploy.yml`; it runs the monitor at a five-minute cadence and publishes the site with GitHub Pages.
- The shared 122-service catalog lives in `data/service-status-catalog.json`.
- `scripts/service_status_monitor.py` performs direct HTTPS GET checks and reads configured public Status API feeds.
- `data/service-status.json` contains the current service states and incidents.
- `data/service-status/history/<service-id>.json` contains history for an individual service. The frontend lazy-loads only the chart selected by the visitor.
- `data/service-status-state.json` is the public persisted snapshot used by the next Actions run to preserve rolling aggregates and incident state. It contains no secrets or visitor identifiers.
- The history uses 5-minute buckets for 24 hours, 15-minute buckets for 7 days, hourly buckets for 30 days, and daily buckets for up to 365 days.
- The first successful scheduled run initializes the history. Earlier measurements are not fabricated.

The schedule is managed by GitHub Actions and is configured to run every five minutes; the workflow also supports manual runs and deploys on changes to `main`. GitHub can delay scheduled starts during periods of high load. For public repositories, GitHub automatically disables scheduled workflows after 60 days without repository activity; if that happens, re-enable this workflow from the repository's Actions page. Standard GitHub-hosted runners are free for this public repository. The monitor is a single observation point from a GitHub-hosted runner, not a worldwide probe network or a measurement from each visitor's ISP.

The catalog is stored separately so the Actions collector does not need to parse this legacy Worker source. Keep `data/service-status-catalog.json` as the source of truth for the active monitor. The frontend and optional legacy Worker catalogs are kept in the same order and use the same service IDs.

## Legacy Worker

The remainder of this directory is retained as an optional alternative backend. It is not called by the live GitHub Pages frontend and its Cron triggers are not part of the active monitor. The files and deployment instructions below are kept for reference only.

## Monitored catalog

The fixed catalog contains **122 monitored endpoints**:

- Search: Google Search, Yandex Search, Bing and DuckDuckGo.
- Development and package registries: GitLab, npm Registry and PyPI.
- Maps and geodata: OpenStreetMap, Nominatim, BeaconDB and Overpass API.
- AI: OpenAI, Claude, Gemini, Grok, Perplexity, DeepSeek, Mistral, Cohere, Groq, Hugging Face, OpenRouter, Cursor, GigaChat, Yandex AI, GitHub Copilot, Amazon Bedrock, Azure OpenAI, Fireworks AI, Together AI, Midjourney, ElevenLabs, Replicate, Runway, Windsurf, Stability AI and Luma AI.
- Russian services: Yandex, Yandex Disk, VK, Mail.ru, Dzen, RuTube, Odnoklassniki and Gosuslugi. MAX and Yandex Mail are excluded because of reported VPN access restrictions.
- Banks and payments: 26 major and regional Russian bank websites (Sber, VTB, T-Bank, Alfa-Bank, Gazprombank, Sovcombank, PSB, Rosselkhozbank, MKB, MTS Bank, DOM.RF, Zenit, Ak Bars, Bank Saint Petersburg, Uralsib, Modulbank, Absolut, BCS, UBRR, Bank Rossiya, UniCredit, Avers, Chelindbank, Ozon Bank, Tochka and MSP Bank) plus Mir and SBP.
- Cloud, CDN, DNS and hosting: AWS, Google Cloud, Azure, Yandex Cloud, VK Cloud, Cloud.ru, Selectel, MWS, Timeweb, REG.RU, Beget, Rostelecom Cloud, CDNvideo, EdgeCenter, Qrator, NGENIX, AdGuard DNS, Quad9 DNS, RIPE NCC, DigitalOcean, Akamai and Bunny.net.
- Games and consoles: Epic Games, Riot Games, EA Servers, PlayStation Network, Xbox Network, Roblox and Rockstar Games.
- Marketplaces: the Ozon marketplace and Wildberries are excluded because VPN/datacenter IPs are restricted. Ozon Bank remains separately monitored in the bank category.
- Other global platforms, communications, media and development services: Telegram, YouTube, Cloudflare, GitHub, Discord, Steam Store, Steam Community, Steam Web API, NextDNS, Reddit, X, Twitch, Spotify, Wikipedia, WhatsApp and Microsoft, plus Russian telecom operator websites.

This is a curated set of 26 major and regional bank websites, not the complete register. The Bank of Russia's directory, updated 2026-11-02, lists 340 credit organizations and 1,793 website addresses (including non-bank credit organizations): https://www.cbr.ru/banking_sector/credit/cowebsites/.

OpenStreetMap, Nominatim, BeaconDB and Rockstar are checked with ordinary HTTPS GET requests to their public pages; no service-specific API is required for those checks. AdGuard DNS is checked through its documented JSON DNS-over-HTTPS endpoint. Quad9 is checked through its official uptime dashboard; the GitHub runner does not issue a Quad9 DNS query because Quad9's DoH requires HTTP/2, which Python's standard `urllib` collector does not support. Overpass API receives a minimal count query and an identifying User-Agent. Roblox is also checked directly over HTTPS, with its official status feed as a supplementary data source. For most bank entries the monitor checks the public website endpoint only. It does **not** authenticate, access private accounts, or verify card authorization, transfers, payment processing, SBP transactions or mobile-app backends. A reachable website is not proof that every banking function is operational.

## VPN access notes

GitLab's Trust & Safety documentation explicitly permits VPN use, with a caveat for access from trade-restricted regions. Epic Games documents proxy configuration for its launcher. Quad9 supports use alongside VPN clients, but its documentation warns that many VPN apps override system DNS; configure Quad9 in the VPN client's custom DNS settings when needed. EA's connection troubleshooting recommends disabling VPN for unstable EA SPORTS FC connections because of additional latency; this is a troubleshooting recommendation, not evidence of a universal account-access ban. No blanket VPN ban was identified in the official material reviewed for the other newly added status pages. Any particular VPN exit IP, region, account or game server can still behave differently.

## What each scheduled check does

For each service, the Worker:
1. Requests a fixed HTTPS probe endpoint from the catalog.
2. Measures HTTP response time up to response headers, records the HTTP code and reachability, and discards the response body.
3. Reads a provider's public Status API where a verified public Statuspage-style endpoint is configured. Official status information is stored separately from the direct HTTP probe.
4. Saves the result in D1 and updates the current service state.
5. Opens an incident after two consecutive non-operational checks and resolves it after two consecutive operational checks.

Structured official status feeds are configured for Cloudflare, GitHub (also used for GitHub Copilot), Discord, OpenAI, Anthropic/Claude, xAI, Perplexity, DeepSeek, Mistral, Cohere, Hugging Face, OpenRouter, Roblox, Epic Games, npm, PyPI (Python Infrastructure), AdGuard, RIPE NCC, DigitalOcean and Akamai. AWS, Azure and other providers have their official status pages linked where available; those pages are not treated as parsed JSON feeds unless a supported endpoint is configured. GitLab, Bunny.net, Riot Games, EA, PlayStation Network, Xbox Network and Quad9 have their official status pages linked, but are not parsed as JSON feeds. These are page-reachability checks, not independent component-status parsing.

The Worker does not accept arbitrary probe URLs, so it cannot be used as an open URL-fetch proxy. Its public API is read-only.

## Cloudflare Free plan-aware scheduling

A single Worker invocation is limited to 50 external subrequests on the Workers Free plan. The 122 endpoints are therefore divided into four stable groups of 31, 31, 30 and 30 services. Each group runs every five minutes, staggered one minute apart:

- `*/5 * * * *` — group 0
- `1-59/5 * * * *` — group 1
- `2-59/5 * * * *` — group 2
- `3-59/5 * * * *` — group 3
- `57 3 * * *` — daily history compaction and retention cleanup

A service is still checked every five minutes. Each batch uses at most 31 direct probes plus up to 7 official Status API requests (at most 38 total), remaining below the 50-subrequest Free-plan ceiling. The Worker limits concurrent outgoing connections to six.

With 122 services and a five-minute interval, the system performs up to 35,136 HTTP probes/day. The D1 writes include one probe row and one service-state upsert per service/check (about 70,272 row writes/day, excluding rare incident changes and daily rollups). Cloudflare plan limits can change; check your account's Workers and D1 usage.

## History and storage

- **Detailed history:** five-minute raw measurements for the most recent 30 days.
- **Long history:** after a day is fully older than the 30-day detailed window, its measurements are compacted into one daily row per service. This preserves total checks, successful checks, uptime, average latency, latency sample count, minimum latency and maximum latency.
- **Retention:** raw rows, daily rollups and resolved incidents are retained for up to 365 days. Daily compaction is aligned to UTC day boundaries so partial days are not overwritten.
- **Chart resolution:** 5-minute buckets (24h), 15-minute buckets (7d), 1-hour buckets (30d), daily buckets (90d and 365d).
- **Coverage:** the API reports the fraction of expected checks that were actually stored. A missed Cron run is not counted as a successful measurement.

The one-year chart is daily-aggregated for data older than 30 days; it is not a full year of five-minute samples. This keeps the history practical within D1 storage limits while retaining long-term uptime and latency trends.

## Deploy

You need a Cloudflare account with Workers and D1 enabled, and Node.js/npm available on your computer.

First create a D1 database in the Cloudflare dashboard (Workers & Pages → Storage & databases → D1). Name it exactly `makakaiglitch-service-status`. Copy its database ID.

From this directory, log in and replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with the ID from the dashboard:

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

Wrangler prints a `workers.dev` URL. Open `/tools/service-status/`, choose **Settings**, paste that URL into **Cloudflare Worker API URL**, then save and connect.

The first three monitor batches start on their next Cron runs. History and uptime statistics fill in from the first measurements; previous measurements are not fabricated.

If you already deployed an earlier version of this monitor, re-run the schema command after pulling the updated repository so the `probe_daily` rollup table is created.

## Local test

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
curl "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/api/history?service=selectel&range=365d"
```

## API

- `GET /api/health` — monitoring settings, history resolution and last check time.
- `GET /api/services` — full catalog and latest measurements.
- `GET /api/history?service=telegram&range=24h` — combined latency and availability history. Supported ranges: `24h`, `7d`, `30d`, `90d`, `365d`.
- `GET /api/incidents?days=30` — detected incidents. Supported windows: 7, 30, 90 and 365 days.

All endpoints are read-only and return JSON with permissive CORS for the static GitHub Pages frontend. No visitor IP address, account identifier or personal browsing data is stored by this Worker.

## Measurement notes

- Latency is HTTP response time measured by the Worker until response headers arrive. It is **not** ICMP ping/RTT.
- A 2xx/3xx response is reachable. A 4xx response is recorded as degraded/reachable; network errors, timeouts and 5xx responses are treated as unavailable.
- Official status APIs are supplementary. A missing official API response does not automatically mark a service down.
- Checks run from the Cloudflare Worker execution region. This is one monitoring vantage point, not a global probe network and not a measurement from the visitor's ISP, home router or device.
- Some services can rate-limit or block automated requests. In those cases the recorded HTTP code and endpoint may need review.
- Uptime measures the availability of the monitored website/endpoint, combined with official major-outage state where configured. It does not guarantee that every feature of a service works.

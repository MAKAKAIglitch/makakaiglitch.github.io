# Service Status Monitor — Cloudflare Worker

This Worker powers the Service Status page at `/tools/service-status/`.

## Monitored catalog

The fixed catalog contains **111 monitored endpoints**:

- Search: Google Search, Yandex Search, Bing and DuckDuckGo.
- Maps and geodata: OpenStreetMap, Nominatim and BeaconDB.
- AI: OpenAI, Claude, Gemini, Grok, Perplexity, DeepSeek, Mistral, Cohere, Groq, Hugging Face, OpenRouter, Cursor, GigaChat, Yandex AI, GitHub Copilot, Amazon Bedrock, Azure OpenAI, Fireworks AI, Together AI, Midjourney, ElevenLabs, Replicate, Runway, Windsurf, Stability AI and Luma AI.
- Russian services: Yandex, Yandex Mail, Yandex Disk, VK, Mail.ru, Dzen, RuTube, Odnoklassniki, MAX and Gosuslugi.
- Banks and payments: 26 major and regional Russian bank websites (Sber, VTB, T-Bank, Alfa-Bank, Gazprombank, Sovcombank, PSB, Rosselkhozbank, MKB, MTS Bank, DOM.RF, Zenit, Ak Bars, Bank Saint Petersburg, Uralsib, Modulbank, Absolut, BCS, UBRR, Bank Rossiya, UniCredit, Avers, Chelindbank, Ozon Bank, Tochka and MSP Bank) plus Mir and SBP.
- Cloud, CDN and hosting: AWS, Google Cloud, Azure, Yandex Cloud, VK Cloud, Cloud.ru, Selectel, MWS, Timeweb, REG.RU, Beget, Rostelecom Cloud, CDNvideo, EdgeCenter, Qrator and NGENIX.
- Games: Roblox and Rockstar Games.
- Marketplaces: Wildberries and Ozon (Ozon's marketplace, separate from Ozon Bank).
- Other global platforms, communications, media and development services: Telegram, YouTube, Cloudflare, GitHub, Discord, Steam Store, Steam Community, Steam Web API, NextDNS, Reddit, X, Twitch, Spotify, Wikipedia, WhatsApp and Microsoft, plus Russian telecom operator websites.

This is a curated set of 26 major and regional bank websites, not the complete register. The Bank of Russia's directory, updated 2026-11-02, lists 340 credit organizations and 1,793 website addresses (including non-bank credit organizations): https://www.cbr.ru/banking_sector/credit/cowebsites/.

OpenStreetMap, Nominatim, BeaconDB, Wildberries, Ozon and Rockstar are checked with ordinary HTTPS GET requests to their public pages; no service-specific API is required for those checks. Roblox is also checked directly over HTTPS, with its official status feed as a supplementary data source. For most bank entries the monitor checks the public website endpoint only. It does **not** authenticate, access private accounts, or verify card authorization, transfers, payment processing, SBP transactions or mobile-app backends. A reachable website is not proof that every banking function is operational.

## What each scheduled check does

For each service, the Worker:
1. Requests a fixed HTTPS probe endpoint from the catalog.
2. Measures HTTP response time up to response headers, records the HTTP code and reachability, and discards the response body.
3. Reads a provider's public Status API where a verified public Statuspage-style endpoint is configured. Official status information is stored separately from the direct HTTP probe.
4. Saves the result in D1 and updates the current service state.
5. Opens an incident after two consecutive non-operational checks and resolves it after two consecutive operational checks.

Structured official status feeds are configured for Cloudflare, GitHub (also used for GitHub Copilot), Discord, OpenAI, Anthropic/Claude, xAI, Perplexity, DeepSeek, Mistral, Cohere, Hugging Face and OpenRouter. AWS, Azure and other providers have their official status pages linked where available; those pages are not treated as parsed JSON feeds unless a supported endpoint is configured. Other official status pages are linked from service cards when available, but are not scraped if a structured feed is not configured.

The Worker does not accept arbitrary probe URLs, so it cannot be used as an open URL-fetch proxy. Its public API is read-only.

## Cloudflare Free plan-aware scheduling

A single Worker invocation is limited to 50 external subrequests on the Workers Free plan. The 111 endpoints are therefore divided into three stable groups of 37 services each. Each group runs every five minutes, staggered one minute apart:

- `*/5 * * * *` — group 0
- `1-59/5 * * * *` — group 1
- `2-59/5 * * * *` — group 2
- `57 3 * * *` — daily history compaction and retention cleanup

A service is still checked every five minutes. Each batch uses at most 37 direct probes plus up to seven official Status API requests, remaining below the 50-subrequest Free-plan ceiling. The Worker limits concurrent outgoing connections to six.

With 111 services and a five-minute interval, the system performs up to 31,968 HTTP probes/day. The D1 writes include one probe row and one service-state upsert per service/check (about 63,936 row writes/day, excluding rare incident changes and daily rollups). Cloudflare plan limits can change; check your account's Workers and D1 usage.

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

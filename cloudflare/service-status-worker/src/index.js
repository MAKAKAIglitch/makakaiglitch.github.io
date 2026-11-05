const CHECK_INTERVAL_SECONDS = 300;
const RETENTION_DAYS = 365;
const PROBE_TIMEOUT_MS = 8000;
const STATUS_TIMEOUT_MS = 7000;
const MAX_CONCURRENT_SERVICES = 6;

const SERVICES = [
  {id:"telegram",name:"Telegram",category:"communication",symbol:"TG",description:"Telegram Web availability",website:"https://web.telegram.org/",probe_url:"https://web.telegram.org/a/",status_api_url:null,status_page_url:null},
  {id:"youtube",name:"YouTube",category:"media",symbol:"YT",description:"YouTube web endpoint",website:"https://www.youtube.com/",probe_url:"https://www.youtube.com/generate_204",status_api_url:null,status_page_url:null},
  {id:"google",name:"Google",category:"platform",symbol:"G",description:"Google Search endpoint",website:"https://www.google.com/",probe_url:"https://www.google.com/generate_204",status_api_url:null,status_page_url:null},
  {id:"cloudflare",name:"Cloudflare",category:"infrastructure",symbol:"CF",description:"Cloudflare edge trace",website:"https://www.cloudflare.com/",probe_url:"https://www.cloudflare.com/cdn-cgi/trace",status_api_url:"https://www.cloudflarestatus.com/api/v2/summary.json",status_page_url:"https://www.cloudflarestatus.com/"},
  {id:"github",name:"GitHub",category:"development",symbol:"GH",description:"GitHub main website",website:"https://github.com/",probe_url:"https://github.com/",status_api_url:"https://www.githubstatus.com/api/v2/summary.json",status_page_url:"https://www.githubstatus.com/"},
  {id:"discord",name:"Discord",category:"communication",symbol:"DC",description:"Discord Gateway endpoint",website:"https://discord.com/",probe_url:"https://discord.com/api/v10/gateway",status_api_url:"https://discordstatus.com/api/v2/summary.json",status_page_url:"https://discordstatus.com/"},
  {id:"openai",name:"OpenAI",category:"platform",symbol:"AI",description:"ChatGPT website",website:"https://chatgpt.com/",probe_url:"https://chatgpt.com/",status_api_url:"https://status.openai.com/api/v2/summary.json",status_page_url:"https://status.openai.com/"},
  {id:"steam",name:"Steam",category:"media",symbol:"ST",description:"Steam Store website",website:"https://store.steampowered.com/",probe_url:"https://store.steampowered.com/",status_api_url:null,status_page_url:null},
  {id:"nextdns",name:"NextDNS",category:"infrastructure",symbol:"ND",description:"NextDNS test endpoint",website:"https://nextdns.io/",probe_url:"https://test.nextdns.io/",status_api_url:null,status_page_url:null},
  {id:"reddit",name:"Reddit",category:"media",symbol:"R",description:"Reddit website",website:"https://www.reddit.com/",probe_url:"https://www.reddit.com/",status_api_url:null,status_page_url:null},
  {id:"x",name:"X",category:"communication",symbol:"X",description:"X web platform",website:"https://x.com/",probe_url:"https://x.com/",status_api_url:null,status_page_url:null},
  {id:"twitch",name:"Twitch",category:"media",symbol:"TW",description:"Twitch live platform",website:"https://www.twitch.tv/",probe_url:"https://www.twitch.tv/",status_api_url:null,status_page_url:null},
  {id:"spotify",name:"Spotify",category:"media",symbol:"SP",description:"Spotify Web Player",website:"https://open.spotify.com/",probe_url:"https://open.spotify.com/",status_api_url:null,status_page_url:null},
  {id:"wikipedia",name:"Wikipedia",category:"platform",symbol:"W",description:"Wikipedia main website",website:"https://www.wikipedia.org/",probe_url:"https://www.wikipedia.org/",status_api_url:null,status_page_url:null},
  {id:"whatsapp",name:"WhatsApp",category:"communication",symbol:"WA",description:"WhatsApp Web",website:"https://web.whatsapp.com/",probe_url:"https://web.whatsapp.com/",status_api_url:null,status_page_url:null},
  {id:"microsoft",name:"Microsoft",category:"platform",symbol:"MS",description:"Microsoft website",website:"https://www.microsoft.com/",probe_url:"https://www.microsoft.com/",status_api_url:null,status_page_url:null}
];

const SERVICE_MAP = new Map(SERVICES.map(service => [service.id, service]));
const ALLOWED_RANGES = {
  "24h": {seconds: 86400, bucket: 300},
  "7d": {seconds: 604800, bucket: 900},
  "30d": {seconds: 2592000, bucket: 3600},
  "90d": {seconds: 7776000, bucket: 21600},
  "365d": {seconds: 31536000, bucket: 86400}
};

function json(data, status=200, extraHeaders={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

function cleanText(value, max=240) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0,max);
}

function healthFrom(probe, statusPage) {
  if (!probe.reachable) return "outage";
  const indicator = String(statusPage?.indicator || "").toLowerCase();
  if (indicator.includes("maintenance")) return "maintenance";
  if (indicator.includes("critical") || indicator.includes("major") || indicator.includes("outage")) return "outage";
  if (indicator.includes("minor") || indicator.includes("degraded")) return "degraded";
  if (probe.httpStatus >= 400) return "degraded";
  return "operational";
}

async function checkProbe(service) {
  const started = performance.now();
  try {
    const response = await fetch(service.probe_url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "accept": "text/html,application/json,text/plain,*/*",
        "cache-control": "no-cache",
        "user-agent": "MAKAKAIglitch-ServiceStatus/1.0 (+https://makakaiglitch.github.io/tools/service-status/)"
      },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
    });
    const latencyMs = Math.max(0, Math.round(performance.now() - started));
    const httpStatus = response.status;
    try { await response.body?.cancel(); } catch {}
    return {
      reachable: httpStatus < 500,
      latencyMs,
      httpStatus,
      errorCode: httpStatus >= 500 ? "HTTP_" + httpStatus : (httpStatus >= 400 ? "HTTP_" + httpStatus : null)
    };
  } catch (error) {
    const name = error?.name === "TimeoutError" || error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
    return {reachable:false,latencyMs:null,httpStatus:null,errorCode:name};
  }
}

async function checkStatusPage(service) {
  if (!service.status_api_url) return {available:false,indicator:null,summary:null};
  try {
    const response = await fetch(service.status_api_url, {
      method: "GET",
      redirect: "follow",
      headers: {"accept":"application/json","user-agent":"MAKAKAIglitch-ServiceStatus/1.0 (+https://makakaiglitch.github.io/tools/service-status/)"},
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS)
    });
    if (!response.ok) {
      try { await response.body?.cancel(); } catch {}
      return {available:false,indicator:null,summary:"Status API HTTP " + response.status};
    }
    const data = await response.json();
    const status = data?.status || {};
    return {
      available:true,
      indicator:cleanText(status.indicator,48).toLowerCase() || "unknown",
      summary:cleanText(status.description,240) || null
    };
  } catch {
    return {available:false,indicator:null,summary:null};
  }
}

async function checkService(service) {
  const probe = await checkProbe(service);
  const statusPage = await checkStatusPage(service);
  const health = healthFrom(probe,statusPage);
  const up = probe.reachable && health !== "outage";
  return {
    service,
    checkedAt:Math.floor(Date.now()/1000),
    latencyMs:probe.latencyMs,
    httpStatus:probe.httpStatus,
    reachable:probe.reachable,
    up,
    errorCode:probe.errorCode,
    health,
    statusIndicator:statusPage.indicator,
    statusSummary:statusPage.summary,
    statusApiAvailable:statusPage.available
  };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({length:Math.min(limit,items.length)},async()=>{
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function runScheduledChecks(env, scheduledTime) {
  if (!env.DB) throw new Error("Missing D1 binding: DB");
  const checkedAt = Math.floor((scheduledTime || Date.now())/1000);
  const stateResult = await env.DB.prepare(
    "SELECT service_id, consecutive_bad, consecutive_good, current_incident_id FROM service_state"
  ).all();
  const oldStates = new Map((stateResult.results || []).map(row=>[row.service_id,row]));
  const results = await mapLimit(SERVICES,MAX_CONCURRENT_SERVICES,checkService);
  const statements = [];

  for (const result of results) {
    const serviceId = result.service.id;
    const previous = oldStates.get(serviceId) || {};
    const previousBad = Number(previous.consecutive_bad || 0);
    const previousGood = Number(previous.consecutive_good || 0);
    let incidentId = previous.current_incident_id || null;
    const isBad = result.health !== "operational";
    const nextBad = isBad ? previousBad + 1 : 0;
    const nextGood = isBad ? 0 : previousGood + 1;

    if (isBad && nextBad >= 2 && !incidentId) {
      incidentId = crypto.randomUUID();
      const severity = result.health === "outage" ? "major" : (result.health === "maintenance" ? "maintenance" : "minor");
      const message = result.errorCode
        ? "Проверочный endpoint не ответил: " + result.errorCode
        : (result.statusSummary || (result.health === "maintenance" ? "Официальная status page сообщает о технических работах." : "Состояние сервиса отличается от нормального."));
      statements.push(env.DB.prepare(
        "INSERT INTO incidents (id, service_id, started_at, ended_at, severity, message, source) VALUES (?, ?, ?, NULL, ?, ?, ?)"
      ).bind(incidentId,serviceId,checkedAt,severity,cleanText(message,400),result.statusApiAvailable ? "probe+status_api" : "http_probe"));
    } else if (!isBad && incidentId && nextGood >= 2) {
      statements.push(env.DB.prepare(
        "UPDATE incidents SET ended_at = ? WHERE id = ? AND ended_at IS NULL"
      ).bind(checkedAt,incidentId));
      incidentId = null;
    }

    statements.push(env.DB.prepare(
      "INSERT INTO probe_results (service_id, checked_at, latency_ms, up, http_status, error_code, health_status, status_indicator, status_summary, status_api_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      serviceId,checkedAt,result.latencyMs,result.up ? 1 : 0,result.httpStatus,result.errorCode,
      result.health,result.statusIndicator,result.statusSummary,result.statusApiAvailable ? 1 : 0
    ));

    statements.push(env.DB.prepare(
      "INSERT INTO service_state (service_id, consecutive_bad, consecutive_good, current_incident_id, last_status, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(service_id) DO UPDATE SET consecutive_bad=excluded.consecutive_bad, consecutive_good=excluded.consecutive_good, current_incident_id=excluded.current_incident_id, last_status=excluded.last_status, updated_at=excluded.updated_at"
    ).bind(serviceId,nextBad,nextGood,incidentId,result.health,checkedAt));
  }

  if (statements.length) await env.DB.batch(statements);

  console.log(JSON.stringify({
    event:"service_status_checks_complete",
    checked_at:checkedAt,
    services:results.length,
    available:results.filter(item=>item.up).length,
    incidents_opened:statements.length
  }));
}

async function cleanupOldData(env, nowSeconds=Math.floor(Date.now()/1000)) {
  if (!env.DB) throw new Error("Missing D1 binding: DB");
  const cutoff = nowSeconds - RETENTION_DAYS*86400;
  const result = await env.DB.batch([
    env.DB.prepare("DELETE FROM probe_results WHERE checked_at < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM incidents WHERE ended_at IS NOT NULL AND ended_at < ?").bind(cutoff)
  ]);
  console.log(JSON.stringify({event:"service_status_retention_cleanup",cutoff,statements:result.length}));
}

async function getHealth(env) {
  const row = await env.DB.prepare("SELECT MAX(checked_at) AS last_check_at FROM probe_results").first();
  return {
    ok:true,
    service_count:SERVICES.length,
    interval_minutes:CHECK_INTERVAL_SECONDS/60,
    retention_days:RETENTION_DAYS,
    last_check_at:row?.last_check_at ?? null,
    monitoring_location:"Cloudflare Worker execution region; single vantage point",
    uptime_definition:"HTTP endpoint reachable (status < 500), excluding official major-outage state"
  };
}

async function getServices(env) {
  const [latestResult,uptimeResult,incidentResult] = await Promise.all([
    env.DB.prepare(
      "SELECT p.* FROM probe_results p JOIN (SELECT service_id, MAX(checked_at) AS latest_at FROM probe_results GROUP BY service_id) latest ON latest.service_id=p.service_id AND latest.latest_at=p.checked_at"
    ).all(),
    env.DB.prepare(
      "SELECT service_id, COUNT(*) AS checks_24h, ROUND(100.0 * SUM(up) / COUNT(*), 3) AS uptime_24h FROM probe_results WHERE checked_at >= ? GROUP BY service_id"
    ).bind(Math.floor(Date.now()/1000)-86400).all(),
    env.DB.prepare(
      "SELECT service_id, COUNT(*) AS active_incidents FROM incidents WHERE ended_at IS NULL GROUP BY service_id"
    ).all()
  ]);
  const latest = new Map((latestResult.results || []).map(row=>[row.service_id,row]));
  const uptime = new Map((uptimeResult.results || []).map(row=>[row.service_id,row]));
  const incidents = new Map((incidentResult.results || []).map(row=>[row.service_id,Number(row.active_incidents)]));
  return {
    services:SERVICES.map(service=>{
      const row=latest.get(service.id) || null;
      const stats=uptime.get(service.id) || null;
      return {
        id:service.id,name:service.name,category:service.category,symbol:service.symbol,
        description:service.description,website:service.website,status_page_url:service.status_page_url,
        status:row?.health_status || "unknown",
        latest:row ? {
          checked_at:row.checked_at,latency_ms:row.latency_ms,http_status:row.http_status,
          up:Boolean(row.up),error_code:row.error_code,health_status:row.health_status,
          status_indicator:row.status_indicator,status_summary:row.status_summary,
          status_api_available:Boolean(row.status_api_available)
        } : null,
        uptime_24h:stats ? Number(stats.uptime_24h) : null,
        checks_24h:stats ? Number(stats.checks_24h) : 0,
        active_incidents:incidents.get(service.id) || 0
      };
    })
  };
}

async function getHistory(env, url) {
  const serviceId=url.searchParams.get("service") || "";
  const rangeKey=url.searchParams.get("range") || "24h";
  const service=SERVICE_MAP.get(serviceId);
  const range=ALLOWED_RANGES[rangeKey];
  if (!service) return json({error:"Unknown service id."},400);
  if (!range) return json({error:"Unsupported range. Use 24h, 7d, 30d, 90d or 365d."},400);
  const to=Math.floor(Date.now()/1000);
  const from=to-range.seconds;
  const query=await env.DB.prepare(
    "SELECT (checked_at / ?) * ? AS bucket_at, COUNT(*) AS checks, SUM(up) AS successful, COUNT(*) - SUM(up) AS failed, AVG(latency_ms) AS avg_latency_ms, MIN(latency_ms) AS min_latency_ms, MAX(latency_ms) AS max_latency_ms, COUNT(latency_ms) AS latency_samples FROM probe_results WHERE service_id = ? AND checked_at >= ? GROUP BY bucket_at ORDER BY bucket_at ASC"
  ).bind(range.bucket,range.bucket,serviceId,from).all();
  const rows=query.results || [];
  const checks=rows.reduce((sum,row)=>sum+Number(row.checks||0),0);
  const successful=rows.reduce((sum,row)=>sum+Number(row.successful||0),0);
  const failed=checks-successful;
  const weightedLatency=rows.reduce((sum,row)=>sum+(Number(row.avg_latency_ms||0)*Number(row.latency_samples||0)),0);
  const totalLatencySamples=rows.reduce((sum,row)=>sum+Number(row.latency_samples||0),0);
  const expected=Math.max(1,Math.ceil(range.seconds/CHECK_INTERVAL_SECONDS));
  const coveragePct=Math.min(100,checks/expected*100);
  return json({
    service_id:serviceId,range:rangeKey,bucket_seconds:range.bucket,from,to,
    checks,successful,failed,
    uptime_pct:checks ? Number((successful/checks*100).toFixed(4)) : null,
    coverage_pct:Number(coveragePct.toFixed(2)),
    avg_latency_ms:totalLatencySamples ? Number((weightedLatency/totalLatencySamples).toFixed(2)) : null,
    points:rows.map(row=>{
      const pointChecks=Number(row.checks||0);
      const pointOk=Number(row.successful||0);
      return {
        timestamp:Number(row.bucket_at),checks:pointChecks,successful:pointOk,failed:Number(row.failed||0),
        uptime_pct:pointChecks ? Number((pointOk/pointChecks*100).toFixed(2)) : null,
        avg_latency_ms:row.avg_latency_ms===null ? null : Number(Number(row.avg_latency_ms).toFixed(2)),
        latency_samples:Number(row.latency_samples||0),
        min_latency_ms:row.min_latency_ms===null ? null : Number(row.min_latency_ms),
        max_latency_ms:row.max_latency_ms===null ? null : Number(row.max_latency_ms)
      };
    })
  });
}

async function getIncidents(env, url) {
  const requested=Number(url.searchParams.get("days") || 30);
  const days=[7,30,90,365].includes(requested) ? requested : 30;
  const from=Math.floor(Date.now()/1000)-days*86400;
  const query=await env.DB.prepare(
    "SELECT id,service_id,started_at,ended_at,severity,message,source FROM incidents WHERE started_at >= ? ORDER BY started_at DESC LIMIT 250"
  ).bind(from).all();
  return json({days,incidents:query.results || []});
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") {
      return new Response(null,{status:204,headers:{
        "access-control-allow-origin":"*",
        "access-control-allow-methods":"GET, OPTIONS",
        "access-control-allow-headers":"Content-Type",
        "access-control-max-age":"86400"
      }});
    }
    if (request.method!=="GET") return json({error:"Method not allowed."},405,{"allow":"GET, OPTIONS"});
    if (!url.pathname.startsWith("/api/")) return json({name:"Service Status Monitor API",version:1,endpoints:["/api/health","/api/services","/api/history?service=telegram&range=24h","/api/incidents?days=30"]});
    if (!env.DB) return json({error:"D1 binding DB is not configured."},503);
    try {
      if (url.pathname==="/api/health") return json(await getHealth(env));
      if (url.pathname==="/api/services") return json(await getServices(env));
      if (url.pathname==="/api/history") return await getHistory(env,url);
      if (url.pathname==="/api/incidents") return await getIncidents(env,url);
      return json({error:"Endpoint not found."},404);
    } catch (error) {
      console.error("API request failed:",error?.stack || error);
      return json({error:"Database or API error. Check Worker logs and D1 binding."},503);
    }
  },

  async scheduled(controller, env) {
    try {
      if (controller.cron === "0 3 * * *") {
        await cleanupOldData(env,Math.floor((controller.scheduledTime || Date.now())/1000));
      } else {
        await runScheduledChecks(env,controller.scheduledTime);
      }
    } catch (error) {
      console.error("Scheduled monitor run failed:",error?.stack || error);
      throw error;
    }
  }
};
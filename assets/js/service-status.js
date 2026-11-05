(() => {
"use strict";

const STORAGE_KEY = "makakaiglitch.serviceStatus.api.v1";
const CATALOG = [
  {id:"telegram",name:"Telegram",symbol:"TG",category:"communication",description:"Telegram Web — доступность веб-клиента",website:"https://web.telegram.org/"},
  {id:"youtube",name:"YouTube",symbol:"YT",category:"media",description:"YouTube — основной web endpoint",website:"https://www.youtube.com/"},
  {id:"google",name:"Google",symbol:"G",category:"platform",description:"Google Search — endpoint generate_204",website:"https://www.google.com/"},
  {id:"cloudflare",name:"Cloudflare",symbol:"CF",category:"infrastructure",description:"Cloudflare — edge trace и официальная status page",website:"https://www.cloudflare.com/"},
  {id:"github",name:"GitHub",symbol:"GH",category:"development",description:"GitHub — сайт и официальная status page",website:"https://github.com/"},
  {id:"discord",name:"Discord",symbol:"DC",category:"communication",description:"Discord Gateway и официальная status page",website:"https://discord.com/"},
  {id:"openai",name:"OpenAI",symbol:"AI",category:"platform",description:"ChatGPT и официальная status page",website:"https://chatgpt.com/"},
  {id:"steam",name:"Steam",symbol:"ST",category:"media",description:"Steam Store — доступность магазина",website:"https://store.steampowered.com/"},
  {id:"nextdns",name:"NextDNS",symbol:"ND",category:"infrastructure",description:"NextDNS — тестовый endpoint сервиса",website:"https://test.nextdns.io/"},
  {id:"reddit",name:"Reddit",symbol:"R",category:"media",description:"Reddit — главная страница",website:"https://www.reddit.com/"},
  {id:"x",name:"X",symbol:"X",category:"communication",description:"X — веб-платформа",website:"https://x.com/"},
  {id:"twitch",name:"Twitch",symbol:"TW",category:"media",description:"Twitch — live-платформа",website:"https://www.twitch.tv/"},
  {id:"spotify",name:"Spotify",symbol:"SP",category:"media",description:"Spotify Web Player",website:"https://open.spotify.com/"},
  {id:"wikipedia",name:"Wikipedia",symbol:"W",category:"platform",description:"Wikipedia — главная страница",website:"https://www.wikipedia.org/"},
  {id:"whatsapp",name:"WhatsApp",symbol:"WA",category:"communication",description:"WhatsApp Web",website:"https://web.whatsapp.com/"},
  {id:"microsoft",name:"Microsoft",symbol:"MS",category:"platform",description:"Microsoft — основной web endpoint",website:"https://www.microsoft.com/"}
];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
const state = {
  apiBase: readSavedApi(),
  services: CATALOG.map(item => ({...item,status:"unknown",latest:null,uptime_24h:null,active_incidents:0})),
  incidents: [],
  health: null,
  overviewRange: "24h",
  historyRange: "24h",
  historyService: "telegram",
  overviewService: "telegram",
  loading: false
};
let refreshTimer = null;
let chartSequence = {overview:0,history:0};

function readSavedApi() {
  try { return localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function normaliseBase(value) {
  const url = new URL(String(value || "").trim());
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost","127.0.0.1"].includes(url.hostname))) {
    throw new Error("Для Worker API требуется HTTPS.");
  }
  return url.origin;
}
function apiUrl(path) { return state.apiBase.replace(/\/$/,"") + path; }
async function apiGet(path, timeoutMs=12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(apiUrl(path), {method:"GET",headers:{Accept:"application/json"},cache:"no-store",signal:controller.signal});
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || ("HTTP " + response.status));
    return payload;
  } finally {
    clearTimeout(timer);
  }
}
function setConnection(message, kind="") {
  const note = $("#ss-connection-note");
  note.textContent = message;
  note.classList.toggle("is-error",kind==="error");
  note.classList.toggle("is-ok",kind==="ok");
  $("#ss-live-dot").classList.toggle("is-live",kind==="ok");
  $("#ss-live-dot").classList.toggle("is-error",kind==="error");
  $("#ss-live-label").textContent = kind==="ok" ? "Worker API подключён" : kind==="error" ? "Ошибка подключения API" : "Мониторинг ожидает подключения API";
}
function categoryLabel(category) {
  return ({platform:"Платформы",infrastructure:"Инфраструктура",communication:"Связь",media:"Медиа",development:"Разработка"})[category] || "Сервис";
}
function statusLabel(status) {
  return ({operational:"Работает",degraded:"Нестабильно",outage:"Сбой",maintenance:"Техработы",unknown:"Нет данных"})[status] || "Нет данных";
}
function formatMs(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) + " ms" : "—";
}
function formatPct(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) + "%" : "—";
}
function formatDate(seconds, options={}) {
  if (!seconds) return "—";
  const lang = window.siteI18n?.language === "en" ? "en-US" : "ru-RU";
  try { return new Intl.DateTimeFormat(lang,{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",...options}).format(new Date(seconds*1000)); }
  catch { return new Date(seconds*1000).toLocaleString(); }
}
function formatDuration(start,end) {
  if (!start) return "—";
  const total = Math.max(0,Math.floor(((end || Date.now()/1000)-start)/60));
  const days = Math.floor(total/1440), hours=Math.floor((total%1440)/60), mins=total%60;
  if (days) return days+" д "+hours+" ч";
  if (hours) return hours+" ч "+mins+" мин";
  return mins+" мин";
}
function setTab(tab) {
  $$(".ss-tab").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-selected",String(active));
  });
  $$(".ss-tab-panel").forEach(panel => {
    const active = panel.dataset.panel === tab;
    panel.classList.toggle("is-active",active);
    panel.hidden = !active;
  });
  if (tab==="history") loadHistoryChart("history");
  if (tab==="overview") loadHistoryChart("overview");
  if (tab==="incidents") loadIncidents();
}
function serviceById(id) {
  return state.services.find(service => service.id === id) || CATALOG.find(service => service.id === id) || null;
}
function renderServiceCard(service) {
  const latest = service.latest || {};
  const status = service.status || "unknown";
  const uptime = service.uptime_24h == null ? "—" : Number(service.uptime_24h).toFixed(2)+"%";
  const latency = formatMs(latest.latency_ms);
  const checked = latest.checked_at ? formatDate(latest.checked_at) : "Нет измерений";
  const incidentCount = Number(service.active_incidents || 0);
  const statusSummary = latest.status_summary ? '<div class="ss-service-meta"><span>'+escapeHtml(latest.status_summary)+'</span></div>' : "";
  return '<button class="ss-service-card" type="button" data-service="'+escapeHtml(service.id)+'" aria-label="'+escapeHtml(service.name)+': '+escapeHtml(statusLabel(status))+'">'+
    '<div class="ss-service-top"><div class="ss-service-name-wrap"><span class="ss-service-symbol">'+escapeHtml(service.symbol || service.name.slice(0,2))+'</span><span class="ss-service-name">'+escapeHtml(service.name)+'</span></div><span class="ss-status '+escapeHtml(status)+'">'+escapeHtml(statusLabel(status))+'</span></div>'+
    '<div class="ss-service-description">'+escapeHtml(service.description || "")+'</div>'+
    '<div class="ss-service-metrics"><div><span>Задержка</span><strong>'+latency+'</strong></div><div><span>Uptime / 24 ч</span><strong>'+uptime+'</strong></div><div><span>HTTP</span><strong>'+(latest.http_status ? escapeHtml(latest.http_status) : "—")+'</strong></div></div>'+
    '<div class="ss-service-meta"><span>'+escapeHtml(checked)+'</span><span class="ss-service-incidents">'+(incidentCount ? incidentCount+" активн. инц." : "Без инцидентов")+'</span></div>'+
    statusSummary+
    '</button>';
}
function renderServices() {
  const cards = state.services.map(renderServiceCard).join("");
  $("#ss-overview-services").innerHTML = cards || '<div class="ss-empty-state">Список сервисов пуст.</div>';
  const search = ($("#ss-service-search")?.value || "").trim().toLowerCase();
  const category = $("#ss-category-filter")?.value || "all";
  const status = $("#ss-status-filter")?.value || "all";
  const filtered = state.services.filter(service => {
    const nameMatch = !search || (service.name+" "+service.description).toLowerCase().includes(search);
    const categoryMatch = category==="all" || service.category===category;
    const statusMatch = status==="all" || (status==="unknown" ? !service.latest : service.status===status);
    return nameMatch && categoryMatch && statusMatch;
  });
  $("#ss-all-services").innerHTML = filtered.length ? filtered.map(renderServiceCard).join("") : '<div class="ss-card ss-empty-state ss-no-results">Нет сервисов, подходящих под фильтр.</div>';
  $("#ss-service-count").textContent = filtered.length+" / "+state.services.length+" сервисов";
  populateServiceSelects();
}
function populateServiceSelects() {
  const selects = [$("#ss-overview-service"),$("#ss-history-service")];
  for (const select of selects) {
    if (!select) continue;
    const old = select.value || (select.id==="ss-history-service" ? state.historyService : state.overviewService);
    select.innerHTML = state.services.map(service => '<option value="'+escapeHtml(service.id)+'">'+escapeHtml(service.name)+'</option>').join("");
    select.value = state.services.some(service=>service.id===old) ? old : (state.services[0]?.id || "");
  }
  state.overviewService = $("#ss-overview-service")?.value || state.overviewService;
  state.historyService = $("#ss-history-service")?.value || state.historyService;
}
function renderMetrics() {
  const total = state.services.length;
  const measured = state.services.filter(service=>service.latest);
  const operational = measured.filter(service=>service.status==="operational").length;
  const upValues = state.services.map(service=>service.uptime_24h).filter(value=>value!==null && value!==undefined && Number.isFinite(Number(value)));
  const latencyValues = state.services.map(service=>service.latest?.latency_ms).filter(value=>value!==null && value!==undefined && Number.isFinite(Number(value)));
  $("#ss-total-services").textContent = String(total);
  $("#ss-operational").textContent = measured.length ? String(operational) : "—";
  $("#ss-uptime").textContent = upValues.length ? (upValues.reduce((a,b)=>a+Number(b),0)/upValues.length).toFixed(2)+"%" : "—";
  $("#ss-latency").textContent = latencyValues.length ? Math.round(latencyValues.reduce((a,b)=>a+Number(b),0)/latencyValues.length)+" ms" : "—";
}
function renderIncidents(target, incidents, limit=0) {
  const entries = limit ? incidents.slice(0,limit) : incidents;
  if (!entries.length) {
    target.innerHTML = '<div class="ss-empty-state">Инциденты за выбранный период не найдены.</div>';
    return;
  }
  target.innerHTML = entries.map(item => {
    const service = serviceById(item.service_id);
    const open = !item.ended_at;
    const major = item.severity==="major" || item.severity==="critical";
    return '<article class="ss-incident-row"><span class="ss-incident-mark '+(open ? (major?"major":"") : "resolved")+'"></span><div class="ss-incident-main"><strong>'+escapeHtml(service?.name || item.service_id)+' · '+(open?"Активный инцидент":"Инцидент завершён")+'</strong><p>'+escapeHtml(item.message || "Проблема доступности подтверждена мониторингом")+'</p></div><div class="ss-incident-times"><span>'+escapeHtml(formatDate(item.started_at))+'</span><span class="ss-incident-duration">'+escapeHtml(formatDuration(item.started_at,item.ended_at))+'</span></div></article>';
  }).join("");
}
function renderIncidentSummary(incidents) {
  const active = incidents.filter(item=>!item.ended_at).length;
  const resolved = incidents.filter(item=>item.ended_at).length;
  const severe = incidents.filter(item=>item.severity==="major"||item.severity==="critical").length;
  $("#ss-incident-summary").innerHTML = '<div><span>Всего событий</span><strong>'+incidents.length+'</strong></div><div><span>Активные</span><strong>'+active+'</strong></div><div><span>Серьёзные сбои</span><strong>'+severe+'</strong></div>';
}
async function loadIncidents() {
  if (!state.apiBase) return;
  try {
    const days = $("#ss-incident-period")?.value || "30";
    const result = await apiGet("/api/incidents?days="+encodeURIComponent(days));
    state.incidents = result.incidents || [];
    renderIncidents($("#ss-incidents"),state.incidents);
    renderIncidentSummary(state.incidents);
    renderIncidents($("#ss-overview-incidents"),state.incidents,4);
  } catch (error) {
    $("#ss-incidents").innerHTML = '<div class="ss-empty-state">Не удалось получить журнал: '+escapeHtml(error.message)+'</div>';
  }
}
function linePath(points, accessor, x, y, bucketSeconds=0) {
  let path="", drawing=false, previousTimestamp=null;
  points.forEach(point => {
    const value = accessor(point);
    const timestamp = Number(point.timestamp);
    const gap = previousTimestamp!==null && bucketSeconds>0 && timestamp-previousTimestamp>bucketSeconds*1.5;
    if (value===null || value===undefined || !Number.isFinite(Number(value)) || gap) drawing=false;
    if (value===null || value===undefined || !Number.isFinite(Number(value))) {
      previousTimestamp=Number.isFinite(timestamp) ? timestamp : previousTimestamp;
      return;
    }
    path += (drawing ? "L" : "M") + x(timestamp).toFixed(1) + "," + y(Number(value)).toFixed(1) + " ";
    drawing=true;
    previousTimestamp=timestamp;
  });
  return path.trim();
}
function renderChart(container, response) {
  const points = response.points || [];
  if (!points.length) {
    container.innerHTML = '<div class="ss-empty-state">Для выбранного периода ещё нет сохранённых измерений. Новые точки появятся после плановых проверок Worker.</div>';
    return;
  }
  const W=960,H=350,left=66,right=66,top=24,bottom=49,plotW=W-left-right,plotH=H-top-bottom;
  const maxLatencyRaw=Math.max(0,...points.map(point=>Number(point.avg_latency_ms)||0));
  const maxLatency=Math.max(100,Math.ceil(maxLatencyRaw*1.18/50)*50);
  const timeStart=Number(response.from || points[0].timestamp);
  const timeEnd=Number(response.to || (points[points.length-1].timestamp + Number(response.bucket_seconds || 300)));
  const timeSpan=Math.max(1,timeEnd-timeStart);
  const x=timestamp=>left+Math.max(0,Math.min(1,(Number(timestamp)-timeStart)/timeSpan))*plotW;
  const yLatency=value => top+plotH-(value/maxLatency)*plotH;
  const yUptime=value => top+plotH-(value/100)*plotH;
  let grid="";
  for(let i=0;i<=4;i++){
    const yy=top+plotH-(i/4)*plotH;
    const ms=(maxLatency*i/4);
    const pct=i*25;
    grid += '<line x1="'+left+'" y1="'+yy+'" x2="'+(W-right)+'" y2="'+yy+'" stroke="rgba(215,225,245,.10)" stroke-dasharray="3 5"/>';
    grid += '<text x="'+(left-11)+'" y="'+(yy+4)+'" text-anchor="end" fill="#8794a8" font-size="11">'+Math.round(ms)+'</text>';
    grid += '<text x="'+(W-right+11)+'" y="'+(yy+4)+'" text-anchor="start" fill="#80cfa9" font-size="11">'+pct+'%</text>';
  }
  const bucketSeconds=Number(response.bucket_seconds || 300);
  const latencyPath=linePath(points,point=>point.avg_latency_ms,timestamp=>x(timestamp),yLatency,bucketSeconds);
  const uptimePath=linePath(points,point=>point.uptime_pct,timestamp=>x(timestamp),yUptime,bucketSeconds);
  const isLongRange=response.range!=="24h";
  const axisOptions=isLongRange ? {day:"2-digit",month:"short",...(response.range==="365d"?{year:"2-digit"}:{})} : {hour:"2-digit",minute:"2-digit"};
  const labelFirst=formatDate(timeStart,axisOptions);
  const labelLast=formatDate(timeEnd,axisOptions);
  const labelMiddle=formatDate(Math.floor((timeStart+timeEnd)/2),axisOptions);
  const coverage=response.coverage_pct==null ? "—" : Number(response.coverage_pct).toFixed(1)+"%";
  container.innerHTML = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Combined chart of HTTP latency and uptime">'+
    grid+
    (latencyPath?'<path d="'+latencyPath+'" fill="none" stroke="#aabaff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>':"")+
    (uptimePath?'<path d="'+uptimePath+'" fill="none" stroke="#7ddbb0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>':"")+
    '<line x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+(top+plotH)+'" stroke="rgba(215,225,245,.2)"/>'+
    '<line x1="'+(W-right)+'" y1="'+top+'" x2="'+(W-right)+'" y2="'+(top+plotH)+'" stroke="rgba(125,219,176,.23)"/>'+
    '<text x="'+left+'" y="13" fill="#aabaff" font-size="10">Latency · ms</text><text x="'+(W-right)+'" y="13" text-anchor="end" fill="#7ddbb0" font-size="10">Uptime · %</text>'+
    '<text x="'+left+'" y="'+(H-14)+'" fill="#8491a5" font-size="10">'+escapeHtml(labelFirst)+'</text>'+
    '<text x="'+(W/2)+'" y="'+(H-14)+'" text-anchor="middle" fill="#8491a5" font-size="10">'+escapeHtml(labelMiddle)+'</text>'+
    '<text x="'+(W-right)+'" y="'+(H-14)+'" text-anchor="end" fill="#8491a5" font-size="10">'+escapeHtml(labelLast)+'</text>'+
    '</svg>';
  $("#"+(container.id==="ss-history-chart"?"ss-history-summary":"ss-overview-chart-foot")).dataset.coverage=coverage;
}
async function loadHistoryChart(which) {
  const container = which==="history" ? $("#ss-history-chart") : $("#ss-overview-chart");
  const serviceId = which==="history" ? ($("#ss-history-service")?.value || state.historyService) : ($("#ss-overview-service")?.value || state.overviewService);
  const range = which==="history" ? state.historyRange : state.overviewRange;
  const sequence=++chartSequence[which];
  if (!state.apiBase) {
    container.innerHTML='<div class="ss-empty-state">Подключи Worker API во вкладке «Настройки», чтобы строить графики по настоящим измерениям.</div>';
    return;
  }
  container.innerHTML='<div class="ss-empty-state">Загружаю историю измерений…</div>';
  try {
    const result=await apiGet("/api/history?service="+encodeURIComponent(serviceId)+"&range="+encodeURIComponent(range));
    if(sequence!==chartSequence[which])return;
    renderChart(container,result);
    if(which==="history"){
      $("#ss-history-period-label").textContent=({ "24h":"24 часа","7d":"7 дней","30d":"30 дней","90d":"90 дней","365d":"365 дней"})[range] || range;
      const summary=$("#ss-history-summary");
      summary.innerHTML=[
        ["Uptime за период",formatPct(result.uptime_pct)],
        ["Средняя задержка",formatMs(result.avg_latency_ms)],
        ["Проверок",Number(result.checks||0).toLocaleString()],
        ["Покрытие мониторингом",formatPct(result.coverage_pct)]
      ].map(([label,value])=>'<div><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value)+'</strong></div>').join("");
    } else {
      $("#ss-overview-chart-caption").textContent=(serviceById(serviceId)?.name || serviceId)+" · "+({ "24h":"24 часа","7d":"7 дней","30d":"30 дней"})[range];
      $("#ss-overview-chart-foot").textContent="Покрытие: "+formatPct(result.coverage_pct)+". Левая шкала — миллисекунды; правая — доступность.";
    }
  } catch(error) {
    if(sequence!==chartSequence[which])return;
    container.innerHTML='<div class="ss-empty-state">Ошибка загрузки истории: '+escapeHtml(error.message)+'</div>';
  }
}
function setRange(which,range) {
  if(which==="overview")state.overviewRange=range;else state.historyRange=range;
  $$('.ss-range-group[data-range-group="'+which+'"] button').forEach(button=>button.classList.toggle("is-active",button.dataset.range===range));
  loadHistoryChart(which);
}
async function loadAll({quiet=false}={}) {
  if(!state.apiBase) {
    setConnection("Подключи Worker API во вкладке «Настройки», чтобы получать реальные измерения и накапливать историю.");
    renderServices();renderMetrics();
    $("#ss-overview-chart").innerHTML='<div class="ss-empty-state">История появится после подключения Worker и первых проверок.</div>';
    $("#ss-overview-incidents").innerHTML='<div class="ss-empty-state">Инциденты пока не зарегистрированы.</div>';
    return;
  }
  if(state.loading)return;
  state.loading=true;
  if(!quiet)$("#ss-last-update").textContent="Обновляю…";
  try {
    const [health,services,incidents]=await Promise.all([
      apiGet("/api/health"),apiGet("/api/services"),apiGet("/api/incidents?days=7")
    ]);
    state.health=health;
    state.services=(services.services || []).map(item=>({...item,...(CATALOG.find(c=>c.id===item.id)||{})}));
    state.incidents=incidents.incidents || [];
    renderServices();renderMetrics();
    renderIncidents($("#ss-overview-incidents"),state.incidents,4);
    const now=new Date();
    $("#ss-last-update").textContent="Обновлено "+now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
    $("#ss-footer-state").textContent="Cron · "+(health.interval_minutes || 5)+" min · "+(health.retention_days || 365)+" days";
    setConnection("Worker API подключён · "+(health.service_count || state.services.length)+" сервисов · проверки каждые "+(health.interval_minutes || 5)+" минут.", "ok");
    if($("#ss-tab-overview").classList.contains("is-active"))loadHistoryChart("overview");
    if($("#ss-tab-history").classList.contains("is-active"))loadHistoryChart("history");
  } catch(error) {
    setConnection("Не удалось получить данные Worker API: "+error.message+" Проверь URL, CORS, Worker и базу D1.","error");
    $("#ss-last-update").textContent="Ошибка загрузки";
    if(!quiet)$("#ss-settings-message").textContent=error.message;
  } finally {
    state.loading=false;
  }
}
async function testApi() {
  const input=$("#ss-api-url");
  let base;
  try { base=normaliseBase(input.value); }
  catch(error) { showSettingsMessage(error.message,true); return; }
  showSettingsMessage("Проверяю API…");
  try {
    const response=await fetch(base+"/api/health",{headers:{Accept:"application/json"},cache:"no-store"});
    const data=await response.json();
    if(!response.ok || !data.ok)throw new Error(data.error || "Worker API вернул ошибку.");
    showSettingsMessage("Соединение успешно. Worker видит "+data.service_count+" сервисов; хранение "+data.retention_days+" дней.");
  } catch(error) {
    showSettingsMessage("Ошибка: "+error.message,true);
  }
}
function showSettingsMessage(message,isError=false) {
  const node=$("#ss-settings-message");
  node.textContent=message;
  node.classList.toggle("is-error",isError);
}
function saveApi() {
  try {
    const base=normaliseBase($("#ss-api-url").value);
    state.apiBase=base;
    try { localStorage.setItem(STORAGE_KEY,base); } catch {}
    showSettingsMessage("Адрес сохранён в этом браузере. Подключаюсь…");
    loadAll();
    if(refreshTimer)clearInterval(refreshTimer);
    refreshTimer=setInterval(()=>loadAll({quiet:true}),60000);
  } catch(error) { showSettingsMessage(error.message,true); }
}
function bindEvents() {
  $$(".ss-tab").forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.tab)));
  $$("[data-open-tab]").forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.openTab)));
  $("#ss-refresh").addEventListener("click",()=>loadAll());
  $("#ss-save-api").addEventListener("click",saveApi);
  $("#ss-test-api").addEventListener("click",testApi);
  $("#ss-api-url").value=state.apiBase;
  $("#ss-service-search").addEventListener("input",renderServices);
  $("#ss-category-filter").addEventListener("change",renderServices);
  $("#ss-status-filter").addEventListener("change",renderServices);
  $("#ss-overview-service").addEventListener("change",event=>{state.overviewService=event.target.value;loadHistoryChart("overview");});
  $("#ss-history-service").addEventListener("change",event=>{state.historyService=event.target.value;loadHistoryChart("history");});
  $("#ss-incident-period").addEventListener("change",loadIncidents);
  $$(".ss-range-group button").forEach(button=>button.addEventListener("click",()=>setRange(button.closest(".ss-range-group").dataset.rangeGroup,button.dataset.range)));
  document.addEventListener("click",event=>{
    const card=event.target.closest("[data-service]");
    if(!card)return;
    const id=card.dataset.service;
    state.overviewService=id;state.historyService=id;
    $("#ss-overview-service").value=id;$("#ss-history-service").value=id;
    setTab("history");
  });
}
bindEvents();
populateServiceSelects();
renderServices();
renderMetrics();
if(state.apiBase) {
  loadAll();
  refreshTimer=setInterval(()=>loadAll({quiet:true}),60000);
} else {
  loadAll();
}
})();
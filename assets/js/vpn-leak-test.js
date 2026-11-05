(() => {
"use strict";
const $ = id => document.getElementById(id);
const t = value => window.siteI18n?.t(value) || value;
const statusNode = $("vpn-status");
const baselineNode = $("vpn-baseline-state");
const baselineButton = $("vpn-baseline");
const runButton = $("vpn-run");
if (!statusNode || !baselineButton || !runButton) return;
let baseline = null;
let busy = false;

function setStatus(message, state) {
  statusNode.textContent = t(message);
  statusNode.dataset.state = state || "info";
}
function setBaselineLabel(message, state) {
  baselineNode.textContent = t(message);
  baselineNode.dataset.state = state || "idle";
}
function setRow(id, state, message) {
  const row = $(id);
  if (!row) return;
  row.dataset.state = state || "info";
  row.querySelector("p").textContent = t(message);
}
function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {signal: controller.signal, clear: () => clearTimeout(timer)};
}
async function jsonRequest(url, ms) {
  const timeout = timeoutSignal(ms || 8000);
  try {
    const response = await fetch(url, {cache:"no-store", signal:timeout.signal, headers:{Accept:"application/json, text/plain"}});
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally { timeout.clear(); }
}
async function textRequest(url, ms) {
  const timeout = timeoutSignal(ms || 8000);
  try {
    const response = await fetch(url, {cache:"no-store", signal:timeout.signal, headers:{Accept:"text/plain"}});
    if (!response.ok) throw new Error("HTTP " + response.status);
    return (await response.text()).trim();
  } finally { timeout.clear(); }
}
function isV4(value) {
  const p = String(value || "").split(".");
  return p.length === 4 && p.every(part => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}
function isV6(value) {
  const text = String(value || "");
  return text.includes(":") && /^[0-9a-f:.]+$/i.test(text);
}
async function publicIps() {
  const [v4, v6] = await Promise.allSettled([
    jsonRequest("https://api.ipify.org?format=json", 7000),
    jsonRequest("https://api6.ipify.org?format=json", 7000)
  ]);
  return {
    ipv4: v4.status === "fulfilled" && isV4(v4.value.ip) ? v4.value.ip : "",
    ipv6: v6.status === "fulfilled" && isV6(v6.value.ip) ? v6.value.ip : ""
  };
}
function parseCandidateLine(line) {
  const tokens = line.trim().replace(/^a=/,"").split(/\s+/);
  if (tokens.length < 8 || !tokens[0].startsWith("candidate:")) return null;
  const address = tokens[4];
  const typeIndex = tokens.indexOf("typ");
  return {address, type:typeIndex >= 0 ? tokens[typeIndex + 1] : "unknown", protocol:tokens[2] || ""};
}
function isPrivateAddress(ip) {
  if (isV4(ip)) {
    const a = ip.split(".").map(Number);
    return a[0] === 0 || a[0] === 10 || a[0] === 127 || a[0] >= 224 ||
      (a[0] === 169 && a[1] === 254) || (a[0] === 172 && a[1] >= 16 && a[1] <= 31) ||
      (a[0] === 192 && a[1] === 168) || (a[0] === 100 && a[1] >= 64 && a[1] <= 127);
  }
  const low = String(ip).toLowerCase();
  return low === "::1" || low === "::" || low.startsWith("fe80:") || low.startsWith("fc") || low.startsWith("fd");
}
function candidateIsIp(ip) { return isV4(ip) || isV6(ip); }
async function webRtcCheck() {
  if (!window.RTCPeerConnection) return {supported:false, candidates:[], public:[], private:[], error:"WebRTC is unavailable in this browser."};
  let pc;
  try {
    pc = new RTCPeerConnection({iceServers:[
      {urls:"stun:stun.l.google.com:19302"},
      {urls:"stun:stun.cloudflare.com:3478"}
    ]});
    pc.createDataChannel("vpn-leak-check");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await Promise.race([
      new Promise(resolve => {
        if (pc.iceGatheringState === "complete") resolve();
        else pc.addEventListener("icegatheringstatechange", () => {
          if (pc.iceGatheringState === "complete") resolve();
        }, {once:false});
      }),
      new Promise(resolve => setTimeout(resolve, 6500))
    ]);
    const sdp = pc.localDescription?.sdp || "";
    const candidates = sdp.split(/\r?\n/).filter(line => line.startsWith("a=candidate:"))
      .map(parseCandidateLine).filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const candidate of candidates) {
      const key = candidate.address + "|" + candidate.type;
      if (!seen.has(key)) { seen.add(key); unique.push(candidate); }
    }
    return {
      supported:true,
      candidates:unique,
      public:unique.filter(c => candidateIsIp(c.address) && !isPrivateAddress(c.address)).map(c => c.address),
      private:unique.filter(c => candidateIsIp(c.address) && isPrivateAddress(c.address)).map(c => c.address),
      mdns:unique.filter(c => String(c.address).endsWith(".local")).length
    };
  } catch (error) {
    return {supported:true, candidates:[], public:[], private:[], error:error?.message || "WebRTC test failed."};
  } finally {
    try { pc?.close(); } catch {}
  }
}
function parseDnsRows(payload) {
  const rows = Array.isArray(payload) ? payload : (payload?.results || payload?.data || payload?.items || []);
  const dns = [];
  let conclusion = "";
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    if (row.type === "dns" && row.ip) {
      const item = {
        ip:String(row.ip),
        city:[row.city_name, row.region_name, row.country_name].filter(Boolean).join(", "),
        asn:row.asn ? String(row.asn) : ""
      };
      if (!dns.some(x => x.ip === item.ip)) dns.push(item);
    }
    if (row.type === "conclusion" && (row.text || row.ip)) conclusion = String(row.text || row.ip);
    if (row.type === "error") throw new Error(String(row.text || "DNS test service returned an error."));
  }
  return {dns, conclusion};
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function dnsLeakCheck() {
  const id = await textRequest("https://bash.ws/id", 8000);
  if (!/^[a-z0-9-]{8,64}$/i.test(id)) throw new Error("The DNS test service returned an invalid test ID.");
  const images = [];
  for (let i = 1; i <= 12; i++) {
    const image = new Image();
    image.alt = "";
    image.src = "https://" + i + "." + id + ".bash.ws/?probe=" + i;
    images.push(image);
  }
  await delay(1800);
  let parsed = {dns:[], conclusion:""};
  for (let attempt = 0; attempt < 4; attempt++) {
    const payload = await jsonRequest("https://bash.ws/dnsleak/test/" + encodeURIComponent(id) + "?json=2", 8000);
    parsed = parseDnsRows(payload);
    if (parsed.dns.length) break;
    await delay(1100);
  }
  return parsed;
}
function renderList(containerId, items, formatter) {
  const container = $(containerId);
  if (!container) return;
  container.replaceChildren();
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "vpn-observed-item";
    row.textContent = formatter(item);
    container.appendChild(row);
  }
}
async function collectSnapshot() {
  const [ipsResult, rtcResult, dnsResult] = await Promise.allSettled([
    publicIps(), webRtcCheck(), dnsLeakCheck()
  ]);
  return {
    ips:ipsResult.status === "fulfilled" ? ipsResult.value : {ipv4:"", ipv6:"", error:ipsResult.reason?.message || "IP lookup failed"},
    rtc:rtcResult.status === "fulfilled" ? rtcResult.value : {supported:false, candidates:[], public:[], private:[], error:rtcResult.reason?.message || "WebRTC lookup failed"},
    dns:dnsResult.status === "fulfilled" ? dnsResult.value : {dns:[], error:dnsResult.reason?.message || "DNS lookup failed"},
    checkedAt:new Date().toISOString()
  };
}
function compareResults(current) {
  if (!baseline) {
    setRow("vpn-ipv4", current.ips.ipv4 ? "info" : "unknown", current.ips.ipv4 || "IPv4 недоступен в этой сети");
    setRow("vpn-ipv6", current.ips.ipv6 ? "info" : "unknown", current.ips.ipv6 || "IPv6 не обнаружен; это не ошибка само по себе");
    setRow("vpn-webrtc", current.rtc.public.length ? "info" : current.rtc.supported ? "success" : "unknown",
      current.rtc.public.length ? "Публичные кандидаты: " + current.rtc.public.join(", ") : current.rtc.error || "Публичных WebRTC-кандидатов не обнаружено");
    setRow("vpn-dns", current.dns.dns.length ? "info" : "unknown",
      current.dns.dns.length ? "Обнаружено DNS-резолверов: " + current.dns.dns.length : current.dns.error || "DNS-резолверы не получены");
    return;
  }
  const same4 = !!(baseline.ips.ipv4 && current.ips.ipv4 && baseline.ips.ipv4 === current.ips.ipv4);
  const same6 = !!(baseline.ips.ipv6 && current.ips.ipv6 && baseline.ips.ipv6 === current.ips.ipv6);
  setRow("vpn-ipv4", current.ips.ipv4 ? (same4 ? "warning" : "success") : "unknown",
    current.ips.ipv4 ? (same4 ? "IPv4 совпадает с контрольным адресом: " + current.ips.ipv4 : "IPv4 изменился относительно контрольного результата: " + current.ips.ipv4) : "IPv4 недоступен в этой сети");
  setRow("vpn-ipv6", current.ips.ipv6 ? (same6 ? "warning" : "success") : "unknown",
    current.ips.ipv6 ? (same6 ? "IPv6 совпадает с контрольным адресом: возможен обход VPN" : "IPv6 изменился относительно контрольного результата") : "IPv6 не обнаружен; отдельный IPv6-тест не пройден");
  const rtcLeaks = current.rtc.public.filter(ip => (baseline.ips.ipv4 && ip === baseline.ips.ipv4) || (baseline.ips.ipv6 && ip === baseline.ips.ipv6));
  const unrecognizedRtc = current.rtc.public.filter(ip => ip !== current.ips.ipv4 && ip !== current.ips.ipv6);
  let rtcState = "success", rtcText = "Публичные WebRTC-кандидаты не совпали с контрольными адресами.";
  if (rtcLeaks.length) { rtcState = "warning"; rtcText = "Обнаружен контрольный публичный IP в WebRTC: " + rtcLeaks.join(", "); }
  else if (!current.rtc.supported || current.rtc.error) { rtcState = "unknown"; rtcText = current.rtc.error || "WebRTC недоступен."; }
  else if (unrecognizedRtc.length) { rtcState = "warning"; rtcText = "Дополнительные публичные WebRTC-адреса: " + unrecognizedRtc.join(", ") + ". Это требует проверки, но не всегда означает утечку."; }
  else if (!current.rtc.public.length) { rtcState = "info"; rtcText = "Публичные WebRTC-кандидаты не получены; UDP/STUN может быть заблокирован."; }
  setRow("vpn-webrtc", rtcState, rtcText);
  const baselineDns = new Set((baseline.dns?.dns || []).map(item => item.ip));
  const unchangedDns = current.dns.dns.filter(item => baselineDns.has(item.ip));
  const dnsState = current.dns.error ? "unknown" : (unchangedDns.length ? "warning" : "info");
  const dnsText = current.dns.error ? current.dns.error :
    (current.dns.dns.length ? (unchangedDns.length ? "Те же DNS-резолверы видны после включения VPN: " + unchangedDns.map(x => x.ip).join(", ") + ". Это повод проверить маршрут DNS, но само совпадение IP не доказывает утечку." : "Набор DNS-резолверов отличается от контрольного. Это не является самостоятельным доказательством отсутствия утечки.") : "DNS-резолверы не обнаружены.");
  setRow("vpn-dns", dnsState, dnsText);
}
async function run(mode) {
  if (busy) return;
  busy = true;
  baselineButton.disabled = true;
  runButton.disabled = true;
  ["vpn-ipv4","vpn-ipv6","vpn-webrtc","vpn-dns"].forEach(id => setRow(id,"info","Проверка выполняется…"));
  setStatus(mode === "baseline" ? "Снимаю контрольный результат без VPN…" : "Проверяю текущее соединение…", "info");
  try {
    const snapshot = await collectSnapshot();
    if (mode === "baseline") {
      baseline = snapshot;
      setBaselineLabel("Контрольный результат сохранён в памяти этой вкладки", "success");
      setStatus("Исходный результат сохранён. Подключи VPN и запусти проверку ещё раз.", "success");
    } else {
      compareResults(snapshot);
      setStatus(baseline ? "Проверка завершена. Сравни предупреждения с исходным результатом." : "Проверка завершена. Сохрани результат без VPN, чтобы получить сравнение.", "success");
    }
    if (mode === "baseline") {
      setRow("vpn-ipv4", snapshot.ips.ipv4 ? "info" : "unknown",
        snapshot.ips.ipv4 ? "Контрольный IPv4: " + snapshot.ips.ipv4 : "IPv4 недоступен в этой сети");
      setRow("vpn-ipv6", snapshot.ips.ipv6 ? "info" : "unknown",
        snapshot.ips.ipv6 ? "Контрольный IPv6: " + snapshot.ips.ipv6 : "IPv6 не обнаружен; это не ошибка само по себе");
      setRow("vpn-webrtc", snapshot.rtc.error ? "unknown" : "info",
        snapshot.rtc.public.length ? "Контрольные WebRTC-кандидаты: " + snapshot.rtc.public.join(", ") : snapshot.rtc.error || "Публичных WebRTC-кандидатов не обнаружено");
      setRow("vpn-dns", snapshot.dns.error ? "unknown" : "info",
        snapshot.dns.dns.length ? "Контрольных DNS-резолверов: " + snapshot.dns.dns.length : snapshot.dns.error || "DNS-резолверы не обнаружены");
    }
    const dnsItems = snapshot.dns.dns || [];
    $("vpn-dns-servers").hidden = !dnsItems.length;
    renderList("vpn-dns-list", dnsItems, item => [item.ip, item.asn, item.city].filter(Boolean).join(" · "));
    const rtcItems = snapshot.rtc.candidates || [];
    $("vpn-rtc-servers").hidden = !rtcItems.length;
    renderList("vpn-rtc-list", rtcItems, item => item.address + " · " + item.type + " · " + item.protocol);
    if (mode === "baseline") baselineNode.title = snapshot.checkedAt;
  } catch (error) {
    setStatus("Проверка завершилась с ошибкой: " + (error?.message || "неизвестная ошибка"), "error");
  } finally {
    busy = false;
    baselineButton.disabled = false;
    runButton.disabled = false;
  }
}
baselineButton.addEventListener("click", () => run("baseline"));
runButton.addEventListener("click", () => run("current"));
document.addEventListener("site:language-change", () => {
  if (statusNode.dataset.rawMessage) statusNode.textContent = t(statusNode.dataset.rawMessage);
});
})();
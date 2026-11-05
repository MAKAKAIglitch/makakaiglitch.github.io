(() => {
"use strict";
const $ = id => document.getElementById(id);
const t = value => window.siteI18n?.t(value) || value;
const form = $("ip-intel-form");
const input = $("ip-intel-input");
const statusNode = $("ip-intel-status");
const submit = $("ip-intel-submit");
const myIp = $("ip-intel-my-ip");
const copyButton = $("ip-intel-copy");
const mapStatus = $("ip-intel-map-status");
if (!form || !input || !statusNode) return;
let currentIp = "";
let map = null, marker = null, accuracyCircle = null;
const bootstrapCache = new Map();

function setStatus(message, state) {
  statusNode.textContent = t(message);
  statusNode.dataset.state = state || "info";
}
function setField(id, value) {
  const node = $(id);
  if (node) node.textContent = value === null || value === undefined || value === "" ? "—" : String(value);
}
function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms || 9000);
  return {signal:controller.signal, clear:() => clearTimeout(timer)};
}
async function getJson(url, ms) {
  const timeout = timeoutSignal(ms);
  try {
    const response = await fetch(url, {cache:"no-store",signal:timeout.signal,headers:{Accept:"application/json"}});
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally { timeout.clear(); }
}
function ipv4ToBigInt(ip) {
  const parts = String(ip).split(".");
  if (parts.length !== 4 || !parts.every(x => /^\d{1,3}$/.test(x) && Number(x) <= 255)) return null;
  return parts.reduce((n, part) => (n << 8n) | BigInt(Number(part)), 0n);
}
function ipv6ToBigInt(ip) {
  let value = String(ip).toLowerCase().replace(/^\[|\]$/g,"");
  if (!value.includes(":") || value.includes("%")) return null;
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":");
    const v4 = ipv4ToBigInt(value.slice(lastColon + 1));
    if (v4 === null) return null;
    const hi = Number((v4 >> 16n) & 65535n).toString(16);
    const lo = Number(v4 & 65535n).toString(16);
    value = value.slice(0,lastColon + 1) + hi + ":" + lo;
  }
  const chunks = value.split("::");
  if (chunks.length > 2) return null;
  const left = chunks[0] ? chunks[0].split(":") : [];
  const right = chunks.length === 2 && chunks[1] ? chunks[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((chunks.length === 1 && missing !== 0) || (chunks.length === 2 && missing < 1)) return null;
  const groups = [...left, ...Array(Math.max(0,missing)).fill("0"), ...right];
  if (groups.length !== 8 || groups.some(group => !/^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.reduce((n, group) => (n << 16n) | BigInt(parseInt(group,16)), 0n);
}
function ipVersion(ip) {
  if (ipv4ToBigInt(ip) !== null) return 4;
  if (ipv6ToBigInt(ip) !== null) return 6;
  return 0;
}
function reverseName(ip) {
  if (ipVersion(ip) === 4) return ip.split(".").reverse().join(".") + ".in-addr.arpa";
  const hex = ipv6ToBigInt(ip).toString(16).padStart(32,"0");
  return hex.split("").reverse().join(".") + ".ip6.arpa";
}
function parsePrefix(prefix) {
  const parts = String(prefix).split("/");
  if (parts.length !== 2 || !/^\d+$/.test(parts[1])) return null;
  const version = ipVersion(parts[0]);
  const bits = version === 4 ? 32 : version === 6 ? 128 : 0;
  const length = Number(parts[1]);
  const network = version === 4 ? ipv4ToBigInt(parts[0]) : version === 6 ? ipv6ToBigInt(parts[0]) : null;
  if (network === null || length < 0 || length > bits) return null;
  const shift = BigInt(bits - length);
  return {version,length,network:(network >> shift) << shift,bits};
}
function containsIp(ipValue, prefix) {
  const shift = BigInt(prefix.bits - prefix.length);
  return (ipValue >> shift) === (prefix.network >> shift);
}
function rirName(base) {
  const host = new URL(base).hostname.toLowerCase();
  if (host.includes("afrinic")) return "AFRINIC";
  if (host.includes("apnic")) return "APNIC";
  if (host.includes("arin")) return "ARIN";
  if (host.includes("lacnic")) return "LACNIC";
  if (host.includes("ripe")) return "RIPE NCC";
  return host;
}
async function loadBootstrap(version) {
  if (bootstrapCache.has(version)) return bootstrapCache.get(version);
  const url = version === 4 ? "https://data.iana.org/rdap/ipv4.json" : "https://data.iana.org/rdap/ipv6.json";
  const promise = getJson(url, 10000).then(data => data.services || []);
  bootstrapCache.set(version,promise);
  try { return await promise; } catch (error) { bootstrapCache.delete(version); throw error; }
}
async function lookupRir(ip) {
  const version = ipVersion(ip);
  const ipValue = version === 4 ? ipv4ToBigInt(ip) : ipv6ToBigInt(ip);
  if (!version || ipValue === null) throw new Error("Invalid IP address.");
  const services = await loadBootstrap(version);
  let match = null;
  for (const service of services) {
    const prefixes = service[0] || [], urls = service[1] || [];
    for (const cidr of prefixes) {
      const parsed = parsePrefix(cidr);
      if (parsed && parsed.version === version && containsIp(ipValue,parsed) && (!match || parsed.length > match.length)) {
        const base = urls.find(url => String(url).startsWith("https://"));
        if (base) match = {base,length:parsed.length,allocation:cidr};
      }
    }
  }
  if (!match) throw new Error("No RDAP bootstrap entry for this address.");
  const rdap = await getJson(match.base + "ip/" + encodeURIComponent(ip), 10000);
  return {rir:rirName(match.base),server:match.base,allocation:match.allocation,network:rdap.name || rdap.handle || "",start:rdap.startAddress || "",end:rdap.endAddress || "",rdap};
}
async function lookupPtr(ip) {
  const name = reverseName(ip);
  const url = "https://dns.google/resolve?name=" + encodeURIComponent(name) + "&type=PTR";
  const data = await getJson(url,8000);
  const answers = (data.Answer || []).filter(item => item.type === 12).map(item => item.data.replace(/\.$/,""));
  return answers;
}
async function getData(ip) {
  const geoTask = getJson("https://ipwho.is/" + encodeURIComponent(ip),10000);
  const bgpTask = getJson("https://stat.ripe.net/data/network-info/data.json?resource=" + encodeURIComponent(ip) + "&sourceapp=makakaiglitch-tools",10000);
  const ptrTask = lookupPtr(ip);
  const rirTask = lookupRir(ip);
  const [geo,bgp,ptr,rir] = await Promise.allSettled([geoTask,bgpTask,ptrTask,rirTask]);
  return {
    geo:geo.status === "fulfilled" && geo.value.success ? geo.value : null,
    geoError:geo.status === "rejected" ? geo.reason?.message : (geo.value?.success === false ? geo.value.message : ""),
    bgp:bgp.status === "fulfilled" && bgp.value.status === "ok" ? bgp.value.data : null,
    bgpError:bgp.status === "rejected" ? bgp.reason?.message : "",
    ptr:ptr.status === "fulfilled" ? ptr.value : [],
    ptrError:ptr.status === "rejected" ? ptr.reason?.message : "",
    rir:rir.status === "fulfilled" ? rir.value : null,
    rirError:rir.status === "rejected" ? rir.reason?.message : ""
  };
}
function updateMap(geo) {
  const mapNode = $("ip-intel-map");
  const hasLatitude = geo?.latitude !== null && geo?.latitude !== undefined && geo?.latitude !== "";
  const hasLongitude = geo?.longitude !== null && geo?.longitude !== undefined && geo?.longitude !== "";
  if (!geo || !hasLatitude || !hasLongitude || !Number.isFinite(Number(geo.latitude)) || !Number.isFinite(Number(geo.longitude)) || !window.L) {
    mapStatus.textContent = t(window.L ? "Координаты для карты не получены." : "Библиотека карты не загрузилась.");
    if (mapNode) mapNode.classList.add("is-unavailable");
    if (map && marker) map.removeLayer(marker);
    if (map && accuracyCircle) map.removeLayer(accuracyCircle);
    marker = null;
    accuracyCircle = null;
    return;
  }
  mapNode.classList.remove("is-unavailable");
  const lat = Number(geo.latitude), lon = Number(geo.longitude);
  const radius = Number(geo.accuracy_radius);
  const hasRadius = Number.isFinite(radius) && radius > 0;
  const zoom = hasRadius ? (radius <= 5 ? 11 : radius <= 20 ? 9 : radius <= 80 ? 7 : 5) : 5;
  if (!map) {
    map = L.map("ip-intel-map",{scrollWheelZoom:false,zoomControl:true}).setView([lat,lon],zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom:19,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    }).addTo(map);
  } else map.setView([lat,lon],zoom);
  if (marker) map.removeLayer(marker);
  if (accuracyCircle) map.removeLayer(accuracyCircle);
  accuracyCircle = null;
  marker = L.marker([lat,lon]).addTo(map);
  marker.bindPopup(t("Примерная геолокация IP") + (hasRadius ? " · ±" + radius + " km" : ""));
  if (hasRadius) {
    accuracyCircle = L.circle([lat,lon],{radius:Math.min(radius * 1000,2000000),color:"#aebdff",weight:1.5,fillColor:"#8da4ff",fillOpacity:.13}).addTo(map);
    map.fitBounds(accuracyCircle.getBounds(),{padding:[18,18],maxZoom:zoom});
  }
  mapStatus.textContent = hasRadius ? t("Центр оценки; круг показывает ориентировочный радиус ±") + " " + radius + " km." : t("Точка оценки IP; база не сообщила радиус точности.");
  setTimeout(() => map?.invalidateSize(),100);
}
function render(ip,data) {
  const geo = data.geo || {};
  const conn = geo.connection || {};
  const timeZone = geo.timezone?.time_zone || geo.timezone?.id || "";
  const asnNumber = conn.asn_number ?? conn.asn;
  const asn = asnNumber ? (String(asnNumber).startsWith("AS") ? String(asnNumber) : "AS" + asnNumber) : "";
  const asns = data.bgp?.asns || [];
  setField("ip-intel-address",ip);
  setField("ip-intel-asn",asn || (asns.length ? "AS" + asns.join(", AS") : ""));
  setField("ip-intel-asn-org",conn.asn_org || conn.org);
  setField("ip-intel-isp",conn.isp);
  setField("ip-intel-org",conn.org);
  setField("ip-intel-prefix",data.bgp?.prefix || (data.bgpError ? "Недоступно" : "Не найден в BGP"));
  setField("ip-intel-origin",asns.length ? asns.map(value => "AS" + value).join(", ") : "—");
  setField("ip-intel-rir",data.rir ? data.rir.rir : (data.rirError ? "Недоступно" : "—"));
  setField("ip-intel-rdap",data.rir ? [data.rir.network,data.rir.start && data.rir.end ? data.rir.start + " – " + data.rir.end : ""].filter(Boolean).join(" · ") : "—");
  setField("ip-intel-ptr",data.ptr.length ? data.ptr.join(", ") : (data.ptrError ? "Недоступно" : "PTR не опубликован"));
  setField("ip-intel-type",conn.connection_type);
  const security = geo.security || {};
  const vpnFlag = security.isVpn ?? security.vpn;
  const torFlag = security.isTor ?? security.tor;
  const securityText = [vpnFlag === true ? "VPN" : "",torFlag === true ? "Tor" : "",vpnFlag === false && torFlag === false ? "не отмечен базой" : ""].filter(Boolean).join(" · ");
  setField("ip-intel-security",securityText);
  setField("ip-intel-country",[geo.flag?.flag_Icon,geo.flag?.emoji,geo.country].filter(Boolean).filter((value,index,array)=>array.indexOf(value)===index).join(" "));
  setField("ip-intel-region",geo.region);
  setField("ip-intel-city",geo.city);
  const hasGeoCoordinates = geo.latitude !== null && geo.latitude !== undefined && geo.latitude !== "" && geo.longitude !== null && geo.longitude !== undefined && geo.longitude !== "" && Number.isFinite(Number(geo.latitude)) && Number.isFinite(Number(geo.longitude));
  setField("ip-intel-coords",hasGeoCoordinates ? Number(geo.latitude).toFixed(4) + ", " + Number(geo.longitude).toFixed(4) : "");
  setField("ip-intel-accuracy",Number.isFinite(Number(geo.accuracy_radius)) && geo.accuracy_radius !== null && Number(geo.accuracy_radius) > 0 ? "±" + geo.accuracy_radius + " km" : (data.geo ? "Источник не публикует радиус точности" : ""));
  setField("ip-intel-timezone",timeZone);
  updateMap(data.geo);
}
async function lookup(ip) {
  const clean = String(ip || "").trim().replace(/^\[|\]$/g,"");
  if (!ipVersion(clean)) { setStatus("Введи корректный IPv4 или IPv6 адрес.", "error"); return; }
  submit.disabled = true; myIp.disabled = true; copyButton.disabled = true;
  currentIp = clean;
  input.value = clean;
  setStatus("Получаю сведения из IP, BGP, RDAP и reverse DNS источников…","info");
  ["ip-intel-address","ip-intel-asn","ip-intel-asn-org","ip-intel-isp","ip-intel-org","ip-intel-prefix","ip-intel-origin","ip-intel-rir","ip-intel-rdap","ip-intel-ptr","ip-intel-type","ip-intel-security","ip-intel-country","ip-intel-region","ip-intel-city","ip-intel-coords","ip-intel-accuracy","ip-intel-timezone"].forEach(id=>setField(id,"…"));
  try {
    const data = await getData(clean);
    render(clean,data);
    const success = !!data.geo || !!data.bgp || !!data.rir || data.ptr.length > 0;
    const failed = [data.geoError,data.bgpError,data.ptrError,data.rirError].filter(Boolean);
    setStatus(success ? (failed.length ? "Часть источников не ответила; показаны доступные данные." : "Данные получены. Геолокация IP приблизительна.") : "Источники не вернули данные для этого адреса.",success ? "success" : "error");
    copyButton.disabled = false;
  } catch (error) {
    setStatus("Не удалось завершить запрос: " + (error?.message || "ошибка сети"),"error");
  } finally { submit.disabled = false; myIp.disabled = false; }
}
async function myAddress() {
  myIp.disabled = true;
  setStatus("Определяю публичный IP через IPWHOis…","info");
  try {
    const data = await getJson("https://ipwho.is/",10000);
    if (!data.success || !data.ip || !ipVersion(data.ip)) throw new Error(data.message || "IP detection failed.");
    input.value = data.ip;
    await lookup(data.ip);
  } catch (error) {
    setStatus("Не удалось определить свой IP: " + (error?.message || "ошибка сети"),"error");
    myIp.disabled = false;
  }
}
form.addEventListener("submit",event=>{event.preventDefault();lookup(input.value);});
myIp.addEventListener("click",myAddress);
copyButton.addEventListener("click",async()=>{
  if (!currentIp) return;
  try { await navigator.clipboard.writeText(currentIp); setStatus("IP-адрес скопирован.","success"); }
  catch { setStatus("Буфер обмена недоступен в этом контексте.","error"); }
});
myAddress();
})();
(() => {
"use strict";
const $ = (id) => document.getElementById(id);
function status(message,error=false) {
  $("warp-status").textContent=message;
  $("warp-status").dataset.state=error?"error":"success";
}
function sections(text) {
  const data={Interface:{},Peer:{}};
  let current=null;
  for (const line of text.replace(/^\uFEFF/,"").split(/\r?\n/)) {
    const s=line.trim();
    if (!s || s.startsWith("#") || s.startsWith(";")) continue;
    const header=s.match(/^\[([^\]]+)\]$/);
    if (header) { const name=header[1].toLowerCase(); current=name==="interface"?"Interface":name==="peer"?"Peer":null; continue; }
    if (!current) continue;
    const pos=s.indexOf("="); if(pos<1) continue;
    data[current][s.slice(0,pos).trim().toLowerCase()]=s.slice(pos+1).trim();
  }
  return data;
}
function parse() {
  const value=$("warp-import").value.trim();
  if(!value) return status("Сначала вставь текст .conf.",true);
  const parsed=sections(value), i=parsed.Interface, p=parsed.Peer;
  const map={
    "warp-private-key":i.privatekey,"warp-address":i.address,"warp-dns":i.dns,
    "warp-mtu":i.mtu,"warp-jc":i.jc,"warp-jmin":i.jmin,"warp-jmax":i.jmax,
    "warp-peer-key":p.publickey,"warp-psk":p.presharedkey,"warp-endpoint":p.endpoint,
    "warp-allowed-ips":p.allowedips,"warp-keepalive":p.persistentkeepalive
  };
  let count=0;
  for(const [id,v] of Object.entries(map)) if(v!==undefined && v!==""){ $(id).value=v; count++; }
  $("warp-mode").value="awg2"; syncMode();
  if(!count) return status("Не найдены поля [Interface] и [Peer]. Проверь формат.",true);
  status("Импортировано полей: "+count+". Проверь их перед сборкой.");
}
function syncMode(){ $("warp-awg-options").hidden=$("warp-mode").value!=="awg2"; }
function checkKey(value,label) {
  try { if(!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || atob(value).length!==32) throw new Error(); }
  catch { throw new Error(label+": нужен корректный Base64-ключ длиной 32 байта."); }
}
function number(id,label,min,max) {
  const raw=$(id).value.trim();
  if(!/^\d+$/.test(raw)) throw new Error(label+": укажи целое число.");
  const n=Number(raw); if(!Number.isSafeInteger(n)||n<min||n>max) throw new Error(label+": диапазон "+min+"–"+max+".");
  return n;
}
function safe(value,label,pattern) {
  const v=value.trim();
  if(!v||/[\r\n=]/.test(v)||!pattern.test(v)) throw new Error(label+": проверь значение.");
  return v;
}
function build() {
  const priv=$("warp-private-key").value.trim(), pub=$("warp-peer-key").value.trim();
  checkKey(priv,"PrivateKey"); checkKey(pub,"Peer PublicKey");
  const address=safe($("warp-address").value,"Address",/^[0-9a-fA-F:.%/ ,]+$/);
  const dns=safe($("warp-dns").value,"DNS",/^[A-Za-z0-9:.,\s-]+$/);
  const endpoint=safe($("warp-endpoint").value,"Endpoint",/^(?:\[[0-9a-fA-F:]+\]|[A-Za-z0-9.-]+):\d{1,5}$/);
  const port=Number(endpoint.slice(endpoint.lastIndexOf(":")+1));
  if(port<1||port>65535) throw new Error("Endpoint: порт должен быть 1–65535.");
  const allowed=safe($("warp-allowed-ips").value,"AllowedIPs",/^[0-9a-fA-F:./,\s]+$/);
  if(allowed.split(",").some(x=>!x.trim()||!/^[0-9a-fA-F:.]+(?:\/\d{1,3})?$/.test(x.trim()))) throw new Error("AllowedIPs: используй CIDR/IP через запятую.");
  const mtu=number("warp-mtu","MTU",576,1500), keep=number("warp-keepalive","PersistentKeepalive",0,65535);
  const psk=$("warp-psk").value.trim(); if(psk) checkKey(psk,"PresharedKey");
  const lines=["[Interface]","PrivateKey = "+priv,"Address = "+address,"DNS = "+dns,"MTU = "+mtu];
  if($("warp-mode").value==="awg2") {
    const jc=number("warp-jc","Jc",0,128), min=number("warp-jmin","Jmin",0,1280), max=number("warp-jmax","Jmax",0,1280);
    if(min>max) throw new Error("Jmin не может быть больше Jmax.");
    lines.push("Jc = "+jc,"Jmin = "+min,"Jmax = "+max,"S1 = 0","S2 = 0","S3 = 0","S4 = 0","H1 = 1","H2 = 2","H3 = 3","H4 = 4");
  }
  lines.push("","[Peer]","PublicKey = "+pub);
  if(psk) lines.push("PresharedKey = "+psk);
  lines.push("AllowedIPs = "+allowed,"Endpoint = "+endpoint,"PersistentKeepalive = "+keep);
  return lines.join("\n")+"\n";
}
function generate() {
  try {
    $("warp-output").value=build();
    $("warp-copy").disabled=false; $("warp-download").disabled=false;
    status("Конфигурация собрана локально. Ключи не отправлялись на сервер.");
  } catch(e) { status(e.message||"Не удалось собрать конфигурацию.",true); }
}
async function copy() {
  const value=$("warp-output").value; if(!value) return;
  try { await navigator.clipboard.writeText(value); status("Конфигурация скопирована."); }
  catch { $("warp-output").focus(); $("warp-output").select(); status("Нажми Ctrl+C, текст выделен.",true); }
}
function download() {
  const value=$("warp-output").value; if(!value) return;
  const url=URL.createObjectURL(new Blob([value],{type:"text/plain;charset=utf-8"}));
  const a=document.createElement("a"); a.href=url; a.download="warp-amneziawg.conf";
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  status("Файл подготовлен для скачивания.");
}
function clear() {
  for(const id of ["warp-private-key","warp-address","warp-peer-key","warp-psk","warp-jc","warp-jmin","warp-jmax"]) $(id).value="";
  $("warp-import").value=""; $("warp-dns").value="1.1.1.1, 1.0.0.1";
  $("warp-mtu").value="1280"; $("warp-keepalive").value="25";
  $("warp-endpoint").value="engage.cloudflareclient.com:2408";
  $("warp-allowed-ips").value="0.0.0.0/0, ::/0";
  $("warp-jc").value="3"; $("warp-jmin").value="64"; $("warp-jmax").value="128";
  $("warp-output").value=""; $("warp-copy").disabled=true; $("warp-download").disabled=true;
  status("Поля очищены.");
}
$("warp-parse").addEventListener("click",parse);
$("warp-clear").addEventListener("click",clear);
$("warp-mode").addEventListener("change",syncMode);
$("warp-generate").addEventListener("click",generate);
$("warp-copy").addEventListener("click",copy);
$("warp-download").addEventListener("click",download);

const WARP_API_ENDPOINTS=[
 "https://warp-workers.warp-api.cfd","https://warp-sub.warp-api.cfd",
 "https://warp-vercel-chi.warp-api.cfd","https://warp-vercel-murex.warp-api.cfd",
 "https://warp-netlify.warp-api.cfd"
];
const WARP_DNS={
 cloudflare:"1.1.1.1, 1.0.0.1, 2606:4700:4700::1111, 2606:4700:4700::1001",
 google:"8.8.8.8, 8.8.4.4, 2001:4860:4860::8888, 2001:4860:4860::8844",
 yandex:"77.88.8.8, 2a02:6b8::feed:0ff, 77.88.8.1, 2a02:6b8:0:1::feed:0ff",
 yandex_safe:"77.88.8.88, 2a02:6b8::feed:bad, 77.88.8.2, 2a02:6b8:0:1::feed:bad",
 adguard:"94.140.14.14, 2a10:50c0::ad1:ff, 94.140.15.15, 2a10:50c0::ad2:ff",
 quad9:"9.9.9.9, 2620:fe::fe, 149.112.112.112, 2620:fe::9",
 comss_one:"83.220.169.155, 212.109.195.93",
 malw_link:"80.253.249.40, 193.23.209.189, 2a12:bec4:1460:5b7::2, 2a01:ecc0:680:120::2"
};
const WARP_STANDARD_ENDPOINTS=["162.159.192.1","162.159.192.8","162.159.193.1","162.159.193.8","162.159.195.1","162.159.195.8","188.114.96.1","188.114.96.8","188.114.97.1","188.114.97.66","188.114.99.1"];
let lastAutomaticConfig="",lastAutomaticFilename="WARP-AmneziaWG2.conf";
function autoStatus(message,error=false){const el=$("warp-auto-status");el.textContent=message;el.dataset.state=error?"error":"success";}
function validBase64Key(value){if(typeof value!=="string"||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))return false;try{return atob(value).length===32;}catch{return false;}}
function validateWarpResponse(data){
 if(!data||typeof data!=="object")throw new Error("API вернул пустой ответ.");
 if(!validBase64Key(data.privKey))throw new Error("API не вернул корректный PrivateKey.");
 if(!validBase64Key(data.peer_pub))throw new Error("API не вернул корректный публичный ключ WARP.");
 if(typeof data.client_ipv4!=="string"||!data.client_ipv4.includes("/"))throw new Error("API не вернул IPv4-адрес WARP.");
 return data;
}
async function requestWarpAccount(endpoint,withClientHeader=true){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),4000);
 try{
  const headers=withClientHeader?{"X-Client":"WARP"}:{};
  const response=await fetch(endpoint,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",headers,signal:controller.signal});
  if(!response.ok){
   const body=await response.text().catch(()=>"");
   let detail="";
   if(body){
    try{
     const parsed=JSON.parse(body);
     detail=String(parsed.error||parsed.message||parsed.detail||parsed.title||"");
    }catch{
     const plain=body.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
     if(plain&&!/^\s*<!doctype html/i.test(plain))detail=plain.slice(0,150);
    }
   }
   const ray=response.headers.get("cf-ray");
   if(response.headers.get("cf-mitigated")==="challenge")detail="Cloudflare challenge";
   const error=new Error("HTTP "+response.status+(detail?" · "+detail:"")+(ray?" · Ray "+ray:""));
   error.httpStatus=response.status;
   throw error;
  }
  const data=await response.json();
  if(data?.error)throw new Error(String(data.error).slice(0,180));
  return validateWarpResponse(data);
 }catch(error){
  if(error.name==="AbortError")throw new Error("тайм-аут");
  if(error instanceof TypeError){
   const corsError=new Error("CORS или сеть заблокировали запрос");
   corsError.networkTypeError=true;
   throw corsError;
  }
  throw error;
 }finally{clearTimeout(timeout);}
}
async function requestWarpAccountCompatible(endpoint){
 try{
  // Совместимость с официальным warp-generation: сервисы ожидают X-Client: WARP.
  return await requestWarpAccount(endpoint,true);
 }catch(firstError){
  // Если preflight отклонён CORS, повторяем обычный GET без нестандартного заголовка.
  if(!firstError.networkTypeError)throw firstError;
  try{return await requestWarpAccount(endpoint,false);}
  catch(secondError){
   throw new Error("X-Client: "+firstError.message+"; без X-Client: "+secondError.message);
  }
 }
}
async function fetchWarpAccount(){
 const failures=[];
 for(let i=0;i<WARP_API_ENDPOINTS.length;i++){
  const endpoint=WARP_API_ENDPOINTS[i];
  autoStatus("Получаю новый WARP-профиль · API "+(i+1)+"/"+WARP_API_ENDPOINTS.length+"…");
  try{return await requestWarpAccountCompatible(endpoint);}
  catch(error){failures.push(new URL(endpoint).hostname+": "+error.message);}
 }
 throw new Error("Не удалось получить WARP-аккаунт ни от одного API. "+failures.join(" · "));
}
function readAutoSettings(){
 const profile=$("warp-auto-profile").value,dnsKey=$("warp-auto-dns").value,port=Number($("warp-auto-port").value);
 const device=$("warp-auto-device").value,endpointMode=$("warp-auto-endpoint").value;
 const mtu=Number($("warp-auto-mtu").value),keepalive=Number($("warp-auto-keepalive").value);
 const junkProfile=$("warp-auto-junk-profile").value;
 const ipv6=$("warp-auto-ipv6").checked&&device!=="mobile";
 const junk=$("warp-auto-junk").checked&&profile==="awg2"&&junkProfile!=="off";
 if(!WARP_DNS[dnsKey])throw new Error("Выбран неизвестный DNS-сервер.");
 if(![4500,2408,500,1701,880,8854].includes(port))throw new Error("Недопустимый UDP-порт.");
 if(!Number.isInteger(mtu)||mtu<576||mtu>1500)throw new Error("MTU должен быть в диапазоне 576–1500.");
 if(![0,15,25,30].includes(keepalive))throw new Error("Недопустимый PersistentKeepalive.");
 if(!["awg2","wireguard"].includes(profile))throw new Error("Неизвестный формат конфигурации.");
 if(!["hostname","random-ip"].includes(endpointMode))throw new Error("Неизвестный Endpoint.");
 return {profile,dns:WARP_DNS[dnsKey],port,device,endpointMode,mtu,keepalive,junkProfile,ipv6,junk};
}
function buildAutomaticConfig(account,settings){
 const addresses=[account.client_ipv4];
 if(settings.ipv6){
  if(typeof account.client_ipv6!=="string"||!account.client_ipv6.includes(":"))throw new Error("API не вернул IPv6-адрес; отключи IPv6 или попробуй другой API-узел.");
  addresses.push(account.client_ipv6);
 }
 const dns=settings.dns.split(",").map(x=>x.trim()).filter(Boolean);
 const activeDns=settings.ipv6?dns:dns.filter(x=>!x.includes(":"));
 if(!activeDns.length)throw new Error("В выбранном DNS нет IPv4-адресов.");
 const host=settings.endpointMode==="random-ip"?WARP_STANDARD_ENDPOINTS[Math.floor(Math.random()*WARP_STANDARD_ENDPOINTS.length)]:"engage.cloudflareclient.com";
 const lines=["# Cloudflare WARP configuration","# Generated by MAKAKAIglitch WARP Generator","[Interface]","PrivateKey = "+account.privKey,"Address = "+addresses.join(", "),"DNS = "+activeDns.join(", "),"MTU = "+settings.mtu];
 if(settings.profile==="awg2"&&settings.junk){
  const packet=settings.junkProfile==="light"?{Jc:2,Jmin:40,Jmax:64}:{Jc:4,Jmin:40,Jmax:70};
  lines.push("Jc = "+packet.Jc,"Jmin = "+packet.Jmin,"Jmax = "+packet.Jmax,"S1 = 0","S2 = 0","S3 = 0","S4 = 0","H1 = 1","H2 = 2","H3 = 3","H4 = 4");
 }
 lines.push("","[Peer]","PublicKey = "+account.peer_pub,"AllowedIPs = "+(settings.ipv6?"0.0.0.0/0, ::/0":"0.0.0.0/0"),"Endpoint = "+host+":"+settings.port,"PersistentKeepalive = "+settings.keepalive);
 return lines.join("\n")+"\n";
}
function downloadAutomaticFile(){
 if(!lastAutomaticConfig)return;
 const blob=new Blob([lastAutomaticConfig],{type:"application/octet-stream"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=lastAutomaticFilename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function automaticFilename(){
 const d=new Date(),p=n=>String(n).padStart(2,"0");
 return "WARP-"+$("warp-auto-profile").value.toUpperCase()+"-"+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"-"+p(d.getHours())+p(d.getMinutes())+".conf";
}
async function generateAutomatic(){
 const button=$("warp-auto-generate");if(button.disabled)return;
 let settings;try{settings=readAutoSettings();}catch(error){autoStatus(error.message,true);return;}
 button.disabled=true;button.classList.add("is-loading");button.querySelector("span").textContent="Получаю ключи и собираю конфиг…";
 $("warp-auto-warning").hidden=true;
 try{
  const account=await fetchWarpAccount();autoStatus("Собираю "+(settings.profile==="awg2"?"AmneziaWG 2.0":"WireGuard")+" конфигурацию…");
  lastAutomaticConfig=buildAutomaticConfig(account,settings);lastAutomaticFilename=automaticFilename();
  $("warp-auto-output").value=lastAutomaticConfig;$("warp-auto-filename").textContent=lastAutomaticFilename;
  $("warp-auto-result").hidden=false;downloadAutomaticFile();
  autoStatus("Готово. Файл "+lastAutomaticFilename+" скачивается в этой вкладке. Создан новый WARP-профиль.");
 }catch(error){
  const detail=String(error.message||"Неизвестная ошибка");autoStatus(detail,true);
  const warning=$("warp-auto-warning");warning.textContent=detail;warning.hidden=false;
 }finally{button.disabled=false;button.classList.remove("is-loading");button.querySelector("span").textContent="Сгенерировать и скачать .conf";}
}
async function copyAutomatic(){
 if(!lastAutomaticConfig)return;
 try{await navigator.clipboard.writeText(lastAutomaticConfig);autoStatus("Конфигурация скопирована.");}
 catch{$("warp-auto-output").focus();$("warp-auto-output").select();autoStatus("Текст выделен — нажми Ctrl+C.");}
}
function syncAutomaticSettings(){
 const profile=$("warp-auto-profile").value,device=$("warp-auto-device").value,mobile=device==="mobile";
 const ipv6=$("warp-auto-ipv6"),junk=$("warp-auto-junk"),junkProfile=$("warp-auto-junk-profile");
 ipv6.disabled=mobile;if(mobile)ipv6.checked=false;
 junk.disabled=profile!=="awg2";if(profile==="wireguard")junk.checked=false;
 junkProfile.disabled=profile!=="awg2"||!junk.checked;
 $("warp-profile-help").textContent=profile==="awg2"
  ?"AmneziaWG 2.0 с дополнительными J/S/H параметрами. I1/CPS-подпись здесь не добавляется."
  :"Обычный WireGuard без параметров AmneziaWG.";
}
for(const id of ["warp-auto-profile","warp-auto-device","warp-auto-junk"])$(id).addEventListener("change",syncAutomaticSettings);
$("warp-auto-generate").addEventListener("click",generateAutomatic);
$("warp-auto-copy-output").addEventListener("click",copyAutomatic);
$("warp-auto-download-again").addEventListener("click",downloadAutomaticFile);
syncAutomaticSettings();

syncMode();
})();
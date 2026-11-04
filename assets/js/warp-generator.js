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
syncMode();
})();
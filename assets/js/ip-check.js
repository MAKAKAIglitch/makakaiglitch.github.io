(() => {
"use strict";
const $=id=>document.getElementById(id),v4=$("ip-v4"),v6=$("ip-v6"),status=$("ip-status"),refresh=$("ip-refresh"),copyAll=$("ip-copy-all");
if(!v4||!v6||!status||!refresh||!copyAll)return;
const found={v4:"",v6:""},sources={v4:"",v6:""};
const t=s=>window.siteI18n?.t(s)||s;
function message(text,state="info"){status.textContent=t(text);status.dataset.state=state;}
function validV4(value){
 const parts=value.split(".");
 return parts.length===4&&parts.every(part=>/^\d{1,3}$/.test(part)&&Number(part)>=0&&Number(part)<=255);
}
function validV6(value){return value.includes(":")&&/^[0-9a-f:.]+$/i.test(value);}
async function amazonCheckIp(signal){
 const response=await fetch("https://checkip.amazonaws.com/",{cache:"no-store",headers:{Accept:"text/plain"},signal});
 if(!response.ok)throw Error("Amazon CheckIP HTTP "+response.status);
 const value=(await response.text()).trim();
 if(!validV4(value))throw Error("Invalid Amazon CheckIP response");
 return value;
}
async function ipify(url,signal){
 const response=await fetch(url,{cache:"no-store",headers:{Accept:"application/json"},signal});
 if(!response.ok)throw Error("ipify HTTP "+response.status);
 const data=await response.json();
 if(typeof data.ip!=="string")throw Error("Invalid ipify response");
 return data.ip.trim();
}
async function detect(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 refresh.disabled=true;copyAll.disabled=true;found.v4="";found.v6="";sources.v4="";sources.v6="";
 v4.textContent="…";v6.textContent="…";
 document.querySelectorAll("[data-copy-ip]").forEach(button=>button.disabled=true);
 message("Проверяем IPv4 и IPv6…");
 const v4Task=(async()=>{
  try{return {ip:await amazonCheckIp(controller.signal),source:"Amazon CheckIP"};}
  catch{return {ip:await ipify("https://api.ipify.org?format=json",controller.signal),source:"ipify fallback"};}
 })();
 const v6Task=ipify("https://api6.ipify.org?format=json",controller.signal);
 const [v4Result,v6Result]=await Promise.allSettled([v4Task,v6Task]);
 clearTimeout(timer);
 if(v4Result.status==="fulfilled"&&validV4(v4Result.value.ip)){
  found.v4=v4Result.value.ip;sources.v4=v4Result.value.source;v4.textContent=found.v4;$('[data-copy-ip="v4"]').disabled=false;
 }else v4.textContent="—";
 if(v6Result.status==="fulfilled"&&validV6(v6Result.value)){
  found.v6=v6Result.value;sources.v6="ipify";v6.textContent=found.v6;$('[data-copy-ip="v6"]').disabled=false;
 }else v6.textContent="—";
 const count=Number(!!found.v4)+Number(!!found.v6);refresh.disabled=false;copyAll.disabled=!count;
 if(count){
  const source=found.v4?" IPv4: "+sources.v4+".":"";
  message((count===2?"Определены IPv4 и IPv6. ":"Определён один адрес. Второй протокол может быть недоступен в этой сети.")+source,"success");
 }else message("Не удалось определить IP. Проверь соединение и попробуй снова.","error");
}
async function copy(value){
 if(!value)return;
 try{await navigator.clipboard.writeText(value);message("IP-адрес скопирован.","success");}
 catch{message("Буфер обмена недоступен в этом контексте.","error");}
}
refresh.addEventListener("click",detect);
document.querySelectorAll("[data-copy-ip]").forEach(button=>button.addEventListener("click",()=>copy(found[button.dataset.copyIp])));
copyAll.addEventListener("click",()=>copy([found.v4&&"IPv4: "+found.v4,found.v6&&"IPv6: "+found.v6].filter(Boolean).join("\n")));
$("ip-browser-language").textContent=navigator.languages?.join(", ")||navigator.language||"—";
$("ip-timezone").textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||"—";
$("ip-platform").textContent=navigator.userAgentData?.platform||navigator.platform||"—";
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
$("ip-connection").textContent=connection?[connection.effectiveType,connection.downlink?connection.downlink+" Mbps":"",connection.rtt?connection.rtt+" ms RTT":""].filter(Boolean).join(" · ")||"—":"Not exposed by browser";
detect();
})();

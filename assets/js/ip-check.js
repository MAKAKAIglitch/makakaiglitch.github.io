(() => {
"use strict";
const $=id=>document.getElementById(id),v4=$("ip-v4"),v6=$("ip-v6"),status=$("ip-status"),refresh=$("ip-refresh"),copyAll=$("ip-copy-all");
if(!v4||!v6||!status||!refresh||!copyAll)return;
const found={v4:"",v6:""};
const t=s=>window.siteI18n?.t(s)||s;
function message(s,state="info"){status.textContent=t(s);status.dataset.state=state;}
async function query(url,signal){
 const r=await fetch(url+"?format=json",{cache:"no-store",headers:{Accept:"application/json"},signal});
 if(!r.ok)throw Error("HTTP "+r.status);
 const j=await r.json();if(typeof j.ip!=="string")throw Error("Invalid response");return j.ip;
}
async function detect(){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
 refresh.disabled=true;copyAll.disabled=true;found.v4="";found.v6="";v4.textContent="…";v6.textContent="…";
 document.querySelectorAll("[data-copy-ip]").forEach(x=>x.disabled=true);
 message("Проверяем IPv4 и IPv6…");
 const [a,b]=await Promise.allSettled([query("https://api.ipify.org",ctrl.signal),query("https://api6.ipify.org",ctrl.signal)]);
 clearTimeout(timer);
 if(a.status==="fulfilled"){found.v4=a.value;v4.textContent=a.value;$('[data-copy-ip="v4"]').disabled=false;}else v4.textContent="—";
 if(b.status==="fulfilled"){found.v6=b.value;v6.textContent=b.value;$('[data-copy-ip="v6"]').disabled=false;}else v6.textContent="—";
 const count=Number(!!found.v4)+Number(!!found.v6);refresh.disabled=false;copyAll.disabled=!count;
 message(count===2?"Определены IPv4 и IPv6.":count===1?"Определён один адрес. Второй протокол может быть недоступен в этой сети.":"Не удалось определить IP. Проверь соединение и попробуй снова.",count?"success":"error");
}
async function copy(value){
 if(!value)return;try{await navigator.clipboard.writeText(value);message("IP-адрес скопирован.","success");}
 catch{message("Буфер обмена недоступен в этом контексте.","error");}
}
refresh.addEventListener("click",detect);
document.querySelectorAll("[data-copy-ip]").forEach(b=>b.addEventListener("click",()=>copy(found[b.dataset.copyIp])));
copyAll.addEventListener("click",()=>copy([found.v4&&"IPv4: "+found.v4,found.v6&&"IPv6: "+found.v6].filter(Boolean).join("\n")));
$("ip-browser-language").textContent=navigator.languages?.join(", ")||navigator.language||"—";
$("ip-timezone").textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||"—";
$("ip-platform").textContent=navigator.userAgentData?.platform||navigator.platform||"—";
const con=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
$("ip-connection").textContent=con?[con.effectiveType,con.downlink?con.downlink+" Mbps":"",con.rtt?con.rtt+" ms RTT":""].filter(Boolean).join(" · ")||"—":"Not exposed by browser";
detect();
})();
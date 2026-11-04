(() => {
"use strict";
const $=id=>document.getElementById(id),form=$("dns-form"),domain=$("dns-domain"),type=$("dns-type"),status=$("dns-status"),panel=$("dns-result"),statusCode=$("dns-result-status"),answers=$("dns-answers"),submit=$("dns-submit"),copy=$("dns-copy");
if(!form||!domain||!type||!status||!panel||!statusCode||!answers||!submit||!copy)return;
let lines=[];
const t=s=>window.siteI18n?.t(s)||s;
function say(s,state="info"){status.textContent=t(s);status.dataset.state=state;}
function normalize(raw){
 const v=raw.trim().replace(/\.$/,"");if(!v||v.length>253||/[\s/@?#]/.test(v))throw Error("Введите корректное доменное имя.");
 let host;try{host=new URL("http://"+v).hostname;}catch{throw Error("Введите корректное доменное имя.");}
 if(!host||!host.includes(".")||host.includes(".."))throw Error("Введите корректное доменное имя.");
 return host.toLowerCase();
}
function code(n){return ({0:"NOERROR",1:"FORMERR",2:"SERVFAIL",3:"NXDOMAIN",4:"NOTIMP",5:"REFUSED"})[n]||"DNS "+n;}
function render(data){
 answers.replaceChildren();lines=[];const list=Array.isArray(data.Answer)?data.Answer:[];
 statusCode.textContent=code(data.Status);
 if(!list.length){const p=document.createElement("p");p.className="dns-empty";p.textContent=t("Ответов не найдено.");answers.append(p);return;}
 for(const item of list){
  const row=document.createElement("div");row.className="dns-answer-row";
  const meta=document.createElement("div");meta.className="dns-answer-meta";
  const name=document.createElement("strong");name.textContent=item.name||"—";
  const ttl=document.createElement("span");ttl.textContent="TYPE "+item.type+" · TTL "+(item.TTL??"—")+"s";
  const val=document.createElement("code");val.textContent=String(item.data??"");
  meta.append(name,ttl);row.append(meta,val);answers.append(row);lines.push((item.name||"")+" "+item.data);
 }
}
form.addEventListener("submit",async e=>{
 e.preventDefault();let host;try{host=normalize(domain.value);}catch(err){say(err.message,"error");return;}
 submit.disabled=true;copy.disabled=true;panel.hidden=false;answers.replaceChildren();statusCode.textContent="…";say("Отправляем DNS-запрос через Cloudflare…");
 try{
  const url=new URL("https://cloudflare-dns.com/dns-query");url.searchParams.set("name",host);url.searchParams.set("type",type.value);
  const r=await fetch(url,{headers:{Accept:"application/dns-json"},cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);
  const data=await r.json();if(!Number.isInteger(data.Status))throw Error("Invalid DNS response");
  render(data);copy.disabled=!lines.length;say("Запрос завершён: "+code(data.Status),"success");
 }catch(err){statusCode.textContent="ERROR";say("Не удалось выполнить DNS-запрос: "+err.message,"error");}
 finally{submit.disabled=false;}
});
copy.addEventListener("click",async()=>{if(!lines.length)return;try{await navigator.clipboard.writeText(lines.join("\n"));say("DNS-ответы скопированы.","success");}catch{say("Не удалось скопировать ответы.","error");}});
})();
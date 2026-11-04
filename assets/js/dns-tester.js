(() => {
"use strict";
const $=id=>document.getElementById(id);
const list=$("dns-server-list"),form=$("dns-test-form"),domainInput=$("dns-test-domain"),typeInput=$("dns-test-type"),submit=$("dns-test-submit"),status=$("dns-tester-status");
if(!list||!form||!domainInput||!typeInput||!submit||!status)return;
const t=s=>window.siteI18n?.t(s)||s;
const recordTypes={A:1,AAAA:28,CNAME:5,MX:15,NS:2,TXT:16};
const providers={
 https:[
  {id:"njalla",name:"Njalla",endpoint:"https://dns.njal.la/dns-query"},
  {id:"dns-sb",name:"DNS.SB",endpoint:"https://doh.dns.sb/dns-query"},
  {id:"rethink",name:"RethinkDNS",endpoint:"https://sky.rethinkdns.com/"},
  {id:"cloudflare",name:"Cloudflare",endpoint:"https://cloudflare-dns.com/dns-query"}
 ],
 tls:[
  {id:"dot-sb",name:"DNS.SB",endpoint:"tls://dot.sb"},
  {id:"quad9",name:"Quad9",endpoint:"tls://dns.quad9.net"},
  {id:"mullvad-dot",name:"Mullvad (закрыт)",endpoint:"tls://dns.mullvad.net",retired:true,retiredReason:"Публичный DNS Mullvad (DoH/DoT) отключён 2 ноября 2026. Адрес оставлен только как историческая ссылка."},
  {id:"nextdns-dot",name:"NextDNS",endpoint:"tls://dns.nextdns.io"},
  {id:"cloudflare-ip",name:"Cloudflare (IP)",endpoint:"tls://1.1.1.1"}
 ],
 quic:[
  {id:"nextdns-doq",name:"NextDNS",endpoint:"quic://dns.nextdns.io"},
  {id:"controld",name:"Control D Free",endpoint:"quic://p0.freedns.controld.com"},
  {id:"mullvad-doq",name:"Mullvad (DoQ не опубликован)",endpoint:"quic://dns.mullvad.net",retired:true,retiredReason:"Mullvad не публиковал официальный публичный DoQ endpoint. Его публичный DNS-сервис закрыт 2 ноября 2026."}
 ]
};
let protocol="https",busy=false;
const results={https:new Map(),tls:new Map(),quic:new Map()};
function setStatus(message,state="info"){status.textContent=t(message);status.dataset.state=state;}
function normalizeDomain(raw){
 const value=raw.trim();
 if(!value||value.length>253||/[\s/@?#]/.test(value))throw Error("Введите корректное доменное имя.");
 let host;try{host=new URL("http://"+value).hostname.toLowerCase();}catch{throw Error("Введите корректное доменное имя.");}
 if(!host||!host.includes(".")||host.includes(".."))throw Error("Введите корректное доменное имя.");
 return host;
}
function u16(buffer,offset){return (buffer[offset]<<8)|buffer[offset+1];}
function u32(buffer,offset){return buffer[offset]*16777216+(buffer[offset+1]<<16)+(buffer[offset+2]<<8)+buffer[offset+3];}
function buildQuery(host,type){
 const id=crypto.getRandomValues(new Uint16Array(1))[0],labels=host.split("."),encoded=[];
 for(const label of labels){
  const bytes=new TextEncoder().encode(label);
  if(!bytes.length||bytes.length>63)throw Error("Некорректная часть доменного имени.");
  encoded.push(bytes.length,...bytes);
 }
 encoded.push(0);
 const bytes=new Uint8Array(12+encoded.length+4);
 bytes[0]=id>>8;bytes[1]=id&255;bytes[2]=1;bytes[5]=1;bytes.set(encoded,12);
 const offset=12+encoded.length,qtype=recordTypes[type]||1;
 bytes[offset]=qtype>>8;bytes[offset+1]=qtype&255;bytes[offset+3]=1;
 return {id,bytes};
}
function toBase64Url(bytes){
 let binary="";
 for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
 return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function decodeName(buffer,start){
 let offset=start,nextOffset=null,parts=[],guard=0;
 while(guard++<128){
  if(offset>=buffer.length)throw Error("Повреждён DNS-ответ");
  const length=buffer[offset];
  if(length===0){if(nextOffset===null)nextOffset=offset+1;break;}
  if((length&192)===192){
   if(offset+1>=buffer.length)throw Error("Повреждён указатель DNS");
   const pointer=((length&63)<<8)|buffer[offset+1];
   if(nextOffset===null)nextOffset=offset+2;
   offset=pointer;continue;
  }
  if(length&192||offset+1+length>buffer.length)throw Error("Повреждено DNS-имя");
  parts.push(new TextDecoder().decode(buffer.subarray(offset+1,offset+1+length)));
  offset+=length+1;
 }
 if(guard>=128)throw Error("Слишком длинное DNS-имя");
 return {name:parts.join(".")||".",nextOffset:nextOffset===null?offset:nextOffset};
}
function answerText(buffer,type,offset,length){
 if(type===1&&length===4)return Array.from(buffer.subarray(offset,offset+4)).join(".");
 if(type===28&&length===16){
  const parts=[];for(let i=0;i<16;i+=2)parts.push(u16(buffer,offset+i).toString(16));return parts.join(":");
 }
 if(type===2||type===5||type===12)return decodeName(buffer,offset).name;
 if(type===15&&length>=3)return u16(buffer,offset)+" "+decodeName(buffer,offset+2).name;
 if(type===16){
  let cursor=offset,end=offset+length,parts=[];
  while(cursor<end){const size=buffer[cursor++];if(cursor+size>end)break;parts.push(new TextDecoder().decode(buffer.subarray(cursor,cursor+size)));cursor+=size;}
  return parts.map(value=>'"'+value+'"').join(" ");
 }
 return length+" bytes";
}
function parseResponse(buffer,id){
 if(buffer.length<12||u16(buffer,0)!==id)throw Error("Получен некорректный DNS-ответ");
 const flags=u16(buffer,2),rcode=flags&15,questions=u16(buffer,4),answerCount=u16(buffer,6);
 let offset=12;
 for(let i=0;i<questions;i++){const question=decodeName(buffer,offset);offset=question.nextOffset+4;if(offset>buffer.length)throw Error("Неполный DNS-вопрос");}
 const answers=[];
 for(let i=0;i<answerCount;i++){
  const name=decodeName(buffer,offset);offset=name.nextOffset;
  if(offset+10>buffer.length)throw Error("Неполная DNS-запись");
  const type=u16(buffer,offset),ttl=u32(buffer,offset+4),length=u16(buffer,offset+8),dataOffset=offset+10;
  if(dataOffset+length>buffer.length)throw Error("Неполные данные DNS-записи");
  answers.push({name:name.name,type,ttl,value:answerText(buffer,type,dataOffset,length)});
  offset=dataOffset+length;
 }
 const codes={0:"NOERROR",1:"FORMERR",2:"SERVFAIL",3:"NXDOMAIN",4:"NOTIMP",5:"REFUSED"};
 return {rcode,code:codes[rcode]||"RCODE "+rcode,answers};
}
async function attempt(server,host,type){
 const query=buildQuery(host,type),encoded=toBase64Url(query.bytes);
 const url=new URL(server.endpoint);url.searchParams.set("dns",encoded);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000),started=performance.now();
 try{
  const response=await fetch(url,{method:"GET",headers:{Accept:"application/dns-message"},cache:"no-store",signal:controller.signal});
  if(!response.ok)throw Error("HTTP "+response.status);
  const body=new Uint8Array(await response.arrayBuffer());
  return {latency:performance.now()-started,parsed:parseResponse(body,query.id)};
 }finally{clearTimeout(timer);}
}
function median(values){
 const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
}
async function testServer(server,host,type){
 const attempts=await Promise.allSettled([attempt(server,host,type),attempt(server,host,type),attempt(server,host,type)]);
 const good=attempts.filter(result=>result.status==="fulfilled").map(result=>result.value);
 if(!good.length){
  const error=attempts.find(result=>result.status==="rejected")?.reason;
  const message=error?.name==="AbortError"?"тайм-аут":error?.message||"сетевая ошибка";
  throw Error(message+" (возможна блокировка CORS)");
 }
 return {latency:median(good.map(result=>result.latency)),answers:good[0].parsed.answers,rcode:good[0].parsed.code,samples:good.length};
}
function make(tag,className,text){
 const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;
}
async function copy(value){
 try{await navigator.clipboard.writeText(value);setStatus("Адрес DNS-сервера скопирован.","success");}
 catch{setStatus("Не удалось скопировать адрес. Выдели его вручную.","error");}
}
function render(){
 const entries=[...providers[protocol]];
 if(protocol==="https")entries.sort((a,b)=>{
  const av=results.https.get(a.id),bv=results.https.get(b.id);
  if(av?.latency===undefined&&bv?.latency!==undefined)return 1;
  if(bv?.latency===undefined&&av?.latency!==undefined)return -1;
  return (av?.latency??Infinity)-(bv?.latency??Infinity);
 });
 list.replaceChildren();
 entries.forEach((server,index)=>{
  const result=results[protocol].get(server.id),card=make("article","dns-server-card"+(server.retired?" is-retired":""));
  const head=make("div","dns-server-head"),title=make("strong","",server.name);
  const badge=make("span","dns-server-rank",server.retired?t("Отключён"):protocol==="https"&&result?.latency!==undefined?(index===0?t("Самый быстрый"):t("Проверен")):protocol==="https"?t("Не проверен"):t("Настройка"));
  head.append(title,badge);
  const endpoint=make("code","dns-server-endpoint",server.endpoint),meta=make("div","dns-server-result");
  let latency=t("Ожидает проверки"),details=t("DNS-запрос не выполнялся");
  if(server.retired){latency=t("Сервис закрыт");details=t(server.retiredReason);}
  else if(protocol!=="https"){latency=t("Нет браузерного теста");details=t("Нужен отдельный DNS-клиент с поддержкой протокола");}
  else if(result?.latency!==undefined){latency=Math.round(result.latency)+" ms";details=result.rcode+" · "+result.answers.length+" "+t("ответов")+" · "+result.samples+"/3 "+t("попыток");}
  else if(result?.error){latency=t("Ошибка");details=result.error;}
  meta.append(make("strong","dns-server-latency",latency),make("span","dns-server-detail",details));
  const actions=make("div","dns-server-actions"),copyButton=make("button","tool-button secondary",t("Копировать адрес"));
  copyButton.type="button";copyButton.addEventListener("click",()=>copy(server.endpoint));actions.appendChild(copyButton);
  card.append(head,endpoint,meta,actions);list.appendChild(card);
 });
}
function selectProtocol(next){
 protocol=next;
 document.querySelectorAll("[data-protocol]").forEach(button=>{
  const active=button.dataset.protocol===protocol;button.classList.toggle("is-active",active);button.setAttribute("aria-selected",String(active));
 });
 document.querySelectorAll("[data-help]").forEach(section=>section.hidden=section.dataset.help!==protocol);
 form.hidden=protocol!=="https";
 setStatus(protocol==="https"?"Выбран DoH. Нажми кнопку, чтобы сравнить задержку DNS-запросов.":protocol==="tls"?"Для DoT скопируй имя сервера в совместимый DNS-клиент.":"Для DoQ используй клиент, который поддерживает DNS-over-QUIC.");
 render();
}
form.addEventListener("submit",async event=>{
 event.preventDefault();if(busy)return;
 let host;try{host=normalizeDomain(domainInput.value);}catch(error){setStatus(error.message,"error");return;}
 busy=true;submit.disabled=true;submit.textContent=t("Проверяем серверы…");
 providers.https.forEach(server=>results.https.delete(server.id));render();
 setStatus("Отправляем DNS-запросы к DoH-серверам…");
 await Promise.all(providers.https.map(async server=>{
  try{results.https.set(server.id,await testServer(server,host,typeInput.value));}
  catch(error){results.https.set(server.id,{error:error.message});}
 }));
 render();
 const available=providers.https.filter(server=>results.https.get(server.id)?.latency!==undefined).length;
 setStatus("Проверка завершена: "+available+"/"+providers.https.length+" серверов ответили для "+host+".",available?"success":"error");
 busy=false;submit.disabled=false;submit.textContent=t("Проверить HTTPS-серверы");
});
document.querySelectorAll("[data-protocol]").forEach(button=>button.addEventListener("click",()=>selectProtocol(button.dataset.protocol)));
document.addEventListener("site:language-change",()=>{render();submit.textContent=t(busy?"Проверяем серверы…":"Проверить HTTPS-серверы");});
selectProtocol("https");
})();

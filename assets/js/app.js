(() => {
"use strict";
const OWNER="MAKAKAIglitch", API="https://api.github.com/users/"+OWNER+"/repos?type=all&sort=updated&direction=desc&per_page=100";
const CACHE="makakaiglitch.repositories.v4",TTL=300000,SNAPSHOT="/data/repositories.json",$=id=>document.getElementById(id);
const grid=$("repository-grid"),count=$("repository-count"),search=$("repository-search"),sort=$("repository-sort"),empty=$("empty-state"),err=$("error-state"),errText=$("error-message"),retry=$("retry-button"),updated=$("last-updated"),overlay=$("repo-detail-overlay"),close=$("repo-modal-close");
if(!grid||!overlay)return;
let repos=[],controller=null,detailController=null,activeRepo=null;
const t=s=>window.siteI18n?.t(s)||s,loc=()=>window.siteI18n?.language==="en"?"en-US":"ru-RU";
const icons={star:'<svg viewBox="0 0 24 24"><path d="m12 3 2.75 5.58 6.16.9-4.46 4.35 1.05 6.14L12 17.07l-5.5 2.9 1.05-6.14L3.1 9.48l6.15-.9L12 3Z"/></svg>',fork:'<svg viewBox="0 0 24 24"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v3a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4M18 7v2"/></svg>'};
const number=n=>new Intl.NumberFormat(loc()).format(n||0);
const date=v=>v?new Intl.DateTimeFormat(loc(),{day:"numeric",month:"short",year:"numeric"}).format(new Date(v)):t("Дата неизвестна");
function node(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function label(parent,text,icon){const n=node("span","meta-item",text);if(icon)n.insertAdjacentHTML("afterbegin",icon);parent.appendChild(n);}
function valid(r){return r&&r.owner?.login?.toLowerCase()===OWNER.toLowerCase()&&typeof r.name==="string"&&r.html_url?.startsWith("https://github.com/");}
function card(r){
 const article=node("article","repo-card"),open=node("button","repo-card-open");open.type="button";
 const top=node("div","repo-card-top"),wrap=node("div","repo-title-wrap");wrap.appendChild(node("strong","repo-name",r.name));
 if(r.fork||r.archived){const flags=node("div","repo-labels");if(r.fork)flags.appendChild(node("span","repo-label",t("Форк")));if(r.archived)flags.appendChild(node("span","repo-label",t("Архив")));wrap.appendChild(flags);}
 top.appendChild(wrap);
 const desc=node("p","repo-description"+(r.description?"":" is-empty"),r.description||t("Описание пока не добавлено."));
 const meta=node("div","repo-meta");if(r.language){const l=node("span","meta-item");l.appendChild(node("span","language-dot"));l.appendChild(document.createTextNode(r.language));meta.appendChild(l);}
 label(meta,number(r.stargazers_count)+" "+t("Звёзды"),icons.star);label(meta,number(r.forks_count)+" "+t("Форки"),icons.fork);label(meta,t("Обновлён")+" "+date(r.updated_at));
 const hint=node("span","repo-details-hint",t("Подробнее")+" ↗");open.append(top,desc,meta,hint);open.addEventListener("click",()=>showDetails(r));
 const actions=node("div","repo-card-actions"),releases=node("a","repo-release-link",t("Releases")),external=node("a","repo-external","↗");
 releases.href=r.html_url+"/releases";releases.target="_blank";releases.rel="noopener noreferrer";
 external.href=r.html_url;external.target="_blank";external.rel="noopener noreferrer";external.setAttribute("aria-label",t("Открыть на GitHub"));
 actions.append(releases,external);article.append(open,actions);return article;
}
function render(){
 const q=search.value.trim().toLocaleLowerCase(loc()),items=repos.filter(r=>[r.name,r.description||"",r.language||"",(r.topics||[]).join(" "),r.fork?"fork":"",r.parent?.full_name||""].join(" ").toLocaleLowerCase(loc()).includes(q));
 items.sort((a,b)=>sort.value==="stars"?(b.stargazers_count||0)-(a.stargazers_count||0):sort.value==="forks"?(b.forks_count||0)-(a.forks_count||0):sort.value==="name"?a.name.localeCompare(b.name,loc()):new Date(b.updated_at||0)-new Date(a.updated_at||0));
 grid.replaceChildren(...items.map(card));const visibleForks=items.filter(r=>r.fork).length;count.textContent=number(items.length)+(q?" / "+number(repos.length):"")+" "+t("репозиториев")+" · "+number(visibleForks)+" "+t("форков");empty.hidden=items.length>0;grid.hidden=items.length===0;
}
function cacheRead(){try{const c=JSON.parse(sessionStorage.getItem(CACHE)||"null");if(c&&Array.isArray(c.items)){repos=c.items.filter(valid);render();updated.textContent=t("Кэш обновлён")+" "+date(c.savedAt);return Date.now()-c.time<TTL;}}catch{try{sessionStorage.removeItem(CACHE);}catch{}}return false;}
async function load(force=false){
 err.hidden=true;
 if(!repos.length){grid.hidden=false;grid.replaceChildren(node("div","loading-card",t("Получаем список с GitHub")));}
 controller?.abort();controller=new AbortController();const signal=controller.signal;
 try{
  try{
   const response=await fetch(SNAPSHOT+(force?"?v="+Date.now():""),{signal,cache:force?"no-store":"default"});
   if(!response.ok)throw Error("Snapshot HTTP "+response.status);
   const payload=await response.json(),items=Array.isArray(payload)?payload:payload.items;
   if(!Array.isArray(items)||!items.length)throw Error("Repository snapshot is empty or invalid");
   const next=items.filter(valid);
   if(!next.length)throw Error("Repository snapshot contains no repositories for "+OWNER);
   repos=next;
   try{sessionStorage.setItem(CACHE,JSON.stringify({items:repos,time:Date.now(),savedAt:payload.generated_at||new Date().toISOString()}));}catch{}
   render();updated.textContent=t("Снимок GitHub обновлён")+" "+date(payload.generated_at||new Date().toISOString());
   return;
  }catch(snapshotError){
   if(signal.aborted)return;
   const response=await fetch(API,{signal,cache:force?"no-store":"default",headers:{Accept:"application/vnd.github+json"}});
   if(!response.ok)throw Error("Snapshot unavailable; GitHub API HTTP "+response.status);
   const data=await response.json();if(!Array.isArray(data))throw Error("Invalid GitHub response");
   const next=data.filter(valid);if(!next.length)throw Error("GitHub returned no repositories for "+OWNER);
   repos=next;
   try{sessionStorage.setItem(CACHE,JSON.stringify({items:repos,time:Date.now(),savedAt:new Date().toISOString()}));}catch{}
   render();updated.textContent=t("Обновлено")+" "+new Intl.DateTimeFormat(loc(),{hour:"2-digit",minute:"2-digit"}).format(new Date());
  }
 }catch(error){
  if(error.name==="AbortError")return;
  if(repos.length){updated.textContent=t("Показаны сохранённые данные; обновить не удалось");return;}
  grid.hidden=true;errText.textContent=error.message;err.hidden=false;count.textContent=t("Репозитории недоступны");
 }
}
function stat(parent,name,value){const s=node("div","repo-detail-stat");s.append(node("span","repo-detail-stat-label",name),node("strong","repo-detail-stat-value",value));parent.appendChild(s);}
function row(parent,name,value){const d=node("div","repo-detail-row");d.append(node("dt","",name),node("dd","",value||"—"));parent.appendChild(d);}
function link(name,url){const a=node("a","repo-detail-link",name);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function lastPage(header){const x=header?.match(/<[^>]*[?&]page=(\d+)[^>]*>; rel="last"/);return x?Number(x[1]):null;}
async function github(path,signal){const r=await fetch("https://api.github.com/repos/"+OWNER+"/"+encodeURIComponent(activeRepo.name)+path,{signal,headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw Error("HTTP "+r.status);return r;}
async function fetchReleaseData(signal){
 const first=await github("/releases?per_page=100",signal);
 const firstItems=await first.json().catch(()=>[]);
 const pages=lastPage(first.headers.get("Link"))||1;
 const maxPages=Math.min(pages,10),extra=[];
 if(maxPages>1){
  const results=await Promise.allSettled(Array.from({length:maxPages-1},(_,i)=>github("/releases?per_page=100&page="+(i+2),signal)));
  for(const result of results)if(result.status==="fulfilled")extra.push(...await result.value.json().catch(()=>[]));
 }
 let totalCount;
 if(pages<=10)totalCount=firstItems.length+extra.length;
 else{
  const last=await github("/releases?per_page=100&page="+pages,signal);
  const lastItems=await last.json().catch(()=>[]);
  totalCount=(pages-1)*100+lastItems.length;
 }
 return {items:[...firstItems,...extra],totalCount,pages,complete:pages<=10};
}
async function repositoryDetails(r,signal){
 if(r.details&&typeof r.details==="object"){
  const d=r.details;
  return {
   languages:d.languages||{},releases:Array.isArray(d.releases)?d.releases:[],
   releasesCount:Number.isInteger(d.releases_count)?d.releases_count:null,
   releaseDownloads:Number.isInteger(d.release_downloads)?d.release_downloads:null,
   releaseDownloadsScope:d.release_downloads_scope||"all",
   contributorsCount:Number.isInteger(d.contributors_count)?d.contributors_count:null,
   commitsCount:Number.isInteger(d.commits_count)?d.commits_count:null,
   branchesCount:Number.isInteger(d.branches_count)?d.branches_count:null
  };
 }
 const [languagesResult,releasesResult,contributorsResult,commitsResult,branchesResult]=await Promise.allSettled([
  github("/languages",signal),fetchReleaseData(signal),github("/contributors?per_page=1",signal),
  github("/commits?per_page=1",signal),github("/branches?per_page=1",signal)
 ]);
 const releaseData=releasesResult.status==="fulfilled"?releasesResult.value:{items:[],totalCount:null,pages:0};
 let downloads=0;
 for(const release of releaseData.items||[])for(const asset of release.assets||[])downloads+=asset.download_count||0;
 const countFrom=result=>result.status==="fulfilled"?(lastPage(result.value.headers.get("Link"))||1):null;
 return {
  languages:languagesResult.status==="fulfilled"?await languagesResult.value.json().catch(()=>({})): {},
  releases:releaseData.items||[],releasesCount:releaseData.totalCount,releaseDownloads:downloads,
  releaseDownloadsScope:releaseData.pages>10?"latest_1000":releaseData.pages>1?"latest_100":"all",
  contributorsCount:countFrom(contributorsResult),commitsCount:countFrom(commitsResult),branchesCount:countFrom(branchesResult)
 };
}
async function showDetails(r){
 activeRepo=r;detailController?.abort();detailController=new AbortController();const signal=detailController.signal;
 $("repo-modal-title").textContent=r.name;$("repo-modal-description").textContent=r.description||t("Описание пока не добавлено.");
 $("repo-modal-loading").hidden=false;$("repo-modal-loading").textContent=t("Загрузка статистики…");$("repo-modal-content").replaceChildren();$("repo-modal-content").hidden=true;
 overlay.hidden=false;overlay.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");close.focus();
 const detail=await repositoryDetails(r,signal);if(signal.aborted)return;
 const content=$("repo-modal-content"),stats=node("div","repo-detail-stats"),releases=detail.releases||[];
 stat(stats,t("Звёзды"),number(r.stargazers_count));
 stat(stats,t("Форки"),number(r.forks_count));
 stat(stats,t("Наблюдатели"),number(r.subscribers_count??r.watchers_count));
 stat(stats,t("Открытые issues"),number(r.open_issues_count));
 const downloadLabel=detail.releaseDownloadsScope==="latest_1000"?t("Скачивания последних 1000 релизов"):detail.releaseDownloadsScope==="latest_100"?t("Скачивания последних 100 релизов"):t("Скачивания релизов");
 stat(stats,downloadLabel,detail.releaseDownloads===null?t("Недоступно"):number(detail.releaseDownloads));
 stat(stats,t("Количество релизов"),detail.releasesCount===null?t("Недоступно"):number(detail.releasesCount));
 stat(stats,t("Коммиты"),detail.commitsCount===null?t("Недоступно"):number(detail.commitsCount));
 stat(stats,t("Ветки"),detail.branchesCount===null?t("Недоступно"):number(detail.branchesCount));
 stat(stats,t("Контрибьюторы"),detail.contributorsCount===null?t("Недоступно"):number(detail.contributorsCount));
 content.appendChild(stats);
 const info=node("dl","repo-detail-list");
 row(info,t("Основной язык"),r.language);
 row(info,t("Лицензия"),r.license?.spdx_id||r.license?.name||t("Недоступно"));
 row(info,t("Создан"),date(r.created_at));row(info,t("Последнее обновление"),date(r.updated_at));
 row(info,t("Последний push"),date(r.pushed_at));row(info,t("Ветка по умолчанию"),r.default_branch);
 row(info,t("Размер репозитория"),(r.size/1024).toFixed(2)+" MB");
 if(r.fork&&r.parent?.full_name)row(info,t("Источник форка"),r.parent.full_name);
 content.appendChild(info);
 const languages=detail.languages||{},languageSection=node("section","repo-detail-section");
 languageSection.appendChild(node("h3","",t("Языки")));
 if(Object.keys(languages).length){
  const total=Object.values(languages).reduce((a,b)=>a+b,0)||1;
  for(const [name,bytes] of Object.entries(languages).sort((a,b)=>b[1]-a[1])){
   const line=node("div","repo-language-row"),head=node("div","repo-language-top");
   head.append(node("strong","",name),node("span","",Math.round(bytes/total*100)+"%"));
   const bar=node("div","repo-language-bar"),fill=node("span");fill.style.width=(bytes/total*100)+"%";bar.appendChild(fill);
   line.append(head,bar);languageSection.appendChild(line);
  }
 }else languageSection.appendChild(node("p","repo-detail-muted",t("Нет данных о языках")));
 content.appendChild(languageSection);
 if(r.topics?.length){
  const section=node("section","repo-detail-section");section.appendChild(node("h3","",t("Темы")));
  const tags=node("div","repo-topic-list");r.topics.forEach(topic=>tags.appendChild(node("span","repo-topic",topic)));
  section.appendChild(tags);content.appendChild(section);
 }
 const latest=releases[0],releaseSection=node("section","repo-detail-section");
 releaseSection.appendChild(node("h3","",t("Последний релиз")));
 releaseSection.appendChild(node("p","repo-detail-release-name",latest?(latest.name||latest.tag_name):t("Нет опубликованных релизов")));
 if(latest?.published_at)releaseSection.appendChild(node("p","repo-detail-muted",latest.tag_name+" · "+date(latest.published_at)));
 if(latest?.assets?.length){
  const assets=node("div","repo-release-assets");assets.appendChild(node("h4","",t("Файлы последнего релиза")));
  for(const asset of latest.assets){
   const item=node("div","repo-release-asset"),assetLink=link(asset.name,asset.browser_download_url);
   const meta=node("span","repo-detail-muted",number(asset.download_count)+" "+t("скачиваний")+" · "+formatBytes(asset.size));
   item.append(assetLink,meta);assets.appendChild(item);
  }
  releaseSection.appendChild(assets);
 }
 content.appendChild(releaseSection);
 const links=node("div","repo-detail-links");
 links.append(link(t("Открыть репозиторий"),r.html_url),link(t("Открыть README"),r.html_url+"/blob/"+(r.default_branch||"main")+"/README.md"),link(t("Открыть Issues"),r.html_url+"/issues"),link(t("Открыть Commits"),r.html_url+"/commits"),link(t("Releases"),r.html_url+"/releases"));
 if(r.homepage)links.appendChild(link(t("Сайт проекта"),r.homepage));
 const clone=node("button","repo-detail-link",t("Копировать")+" git clone");clone.type="button";
 clone.addEventListener("click",async()=>{try{await navigator.clipboard.writeText("git clone "+r.clone_url);clone.textContent=t("Скопировано");}catch{clone.textContent=t("Недоступно");}});
 links.appendChild(clone);content.appendChild(links);
 $("repo-modal-loading").hidden=true;content.hidden=false;
}
function closeDetails(){detailController?.abort();overlay.hidden=true;overlay.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");activeRepo=null;}
close.addEventListener("click",closeDetails);overlay.addEventListener("click",e=>{if(e.target===overlay)closeDetails();});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)closeDetails();});
search.addEventListener("input",render);sort.addEventListener("change",render);retry.addEventListener("click",()=>load(true));document.addEventListener("site:language-change",()=>{render();if(activeRepo&&!overlay.hidden)showDetails(activeRepo);});
document.addEventListener("keydown",e=>{const x=e.target,typing=x instanceof HTMLElement&&(x.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(x.tagName));if(e.key==="/"&&!typing){e.preventDefault();search.focus();}if(e.key==="Escape"&&document.activeElement===search){search.value="";render();search.blur();}});
if(!cacheRead())load();
})();
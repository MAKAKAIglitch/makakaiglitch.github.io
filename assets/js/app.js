(() => {
"use strict";
const OWNER="MAKAKAIglitch", API="https://api.github.com/users/"+OWNER+"/repos?type=owner&sort=updated&direction=desc&per_page=100";
const CACHE="makakaiglitch.repositories.v2",TTL=300000,$=id=>document.getElementById(id);
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
 if(r.fork||r.archived){const flags=node("div","repo-labels");if(r.fork)flags.appendChild(node("span","repo-label","FORK"));if(r.archived)flags.appendChild(node("span","repo-label","ARCHIVED"));wrap.appendChild(flags);}
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
 const q=search.value.trim().toLocaleLowerCase(loc()),items=repos.filter(r=>[r.name,r.description||"",r.language||"",(r.topics||[]).join(" ")].join(" ").toLocaleLowerCase(loc()).includes(q));
 items.sort((a,b)=>sort.value==="stars"?(b.stargazers_count||0)-(a.stargazers_count||0):sort.value==="name"?a.name.localeCompare(b.name,loc()):new Date(b.updated_at||0)-new Date(a.updated_at||0));
 grid.replaceChildren(...items.map(card));count.textContent=number(items.length)+(q?" / "+number(repos.length):"")+" "+t("репозиториев");empty.hidden=items.length>0;grid.hidden=items.length===0;
}
function cacheRead(){try{const c=JSON.parse(sessionStorage.getItem(CACHE)||"null");if(c&&Array.isArray(c.items)){repos=c.items.filter(valid);render();updated.textContent=t("Кэш обновлён")+" "+date(c.savedAt);return Date.now()-c.time<TTL;}}catch{try{sessionStorage.removeItem(CACHE);}catch{}}return false;}
async function load(force=false){
 err.hidden=true;if(!repos.length){grid.hidden=false;grid.replaceChildren(node("div","loading-card",t("Получаем список с GitHub")));}
 controller?.abort();controller=new AbortController();
 try{const r=await fetch(API,{signal:controller.signal,cache:force?"no-store":"default",headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw Error("GitHub API HTTP "+r.status);const data=await r.json();if(!Array.isArray(data))throw Error("Invalid GitHub response");
 repos=data.filter(valid);try{sessionStorage.setItem(CACHE,JSON.stringify({items:repos,time:Date.now(),savedAt:new Date().toISOString()}));}catch{}render();updated.textContent=t("Обновлено")+" "+new Intl.DateTimeFormat(loc(),{hour:"2-digit",minute:"2-digit"}).format(new Date());
 }catch(e){if(e.name==="AbortError")return;if(repos.length){updated.textContent=t("Показаны сохранённые данные; обновить не удалось");return;}grid.hidden=true;errText.textContent=e.message;err.hidden=false;count.textContent=t("Репозитории недоступны");}
}
function stat(parent,name,value){const s=node("div","repo-detail-stat");s.append(node("span","repo-detail-stat-label",name),node("strong","repo-detail-stat-value",value));parent.appendChild(s);}
function row(parent,name,value){const d=node("div","repo-detail-row");d.append(node("dt","",name),node("dd","",value||"—"));parent.appendChild(d);}
function link(name,url){const a=node("a","repo-detail-link",name);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function lastPage(header){const x=header?.match(/<[^>]*[?&]page=(\d+)[^>]*>; rel="last"/);return x?Number(x[1]):null;}
async function github(path,signal){const r=await fetch("https://api.github.com/repos/"+OWNER+"/"+encodeURIComponent(activeRepo.name)+path,{signal,headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw Error("HTTP "+r.status);return r;}
async function showDetails(r){
 activeRepo=r;detailController?.abort();detailController=new AbortController();const signal=detailController.signal;
 $("repo-modal-title").textContent=r.name;$("repo-modal-description").textContent=r.description||t("Описание пока не добавлено.");
 $("repo-modal-loading").hidden=false;$("repo-modal-loading").textContent=t("Загрузка статистики…");$("repo-modal-content").replaceChildren();$("repo-modal-content").hidden=true;
 overlay.hidden=false;overlay.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");close.focus();
 const [langsRel,releasesRel,contributorsRel]=await Promise.allSettled([github("/languages",signal),github("/releases?per_page=100",signal),github("/contributors?per_page=1",signal)]);
 if(signal.aborted)return;
 const content=$("repo-modal-content"),stats=node("div","repo-detail-stats");
 const releases=releasesRel.status==="fulfilled"?await releasesRel.value.json().catch(()=>[]):[];
 let downloads=0;for(const rel of releases||[])for(const asset of rel.assets||[])downloads+=asset.download_count||0;
 const releasePages=releasesRel.status==="fulfilled"?lastPage(releasesRel.value.headers.get("Link")):null;
 const contributorCount=contributorsRel.status==="fulfilled"?(lastPage(contributorsRel.value.headers.get("Link"))||1):null;
 stat(stats,t("Звёзды"),number(r.stargazers_count));stat(stats,t("Форки"),number(r.forks_count));stat(stats,t("Наблюдатели"),number(r.subscribers_count??r.watchers_count));stat(stats,t("Открытые issues"),number(r.open_issues_count));stat(stats,t("Скачивания релизов"),number(downloads));stat(stats,t("Количество релизов"),number(releasePages||releases.length));if(contributorCount!==null)stat(stats,t("Вклад"),number(contributorCount));content.appendChild(stats);
 const details=node("dl","repo-detail-list");row(details,t("Основной язык"),r.language);row(details,t("Лицензия"),r.license?.spdx_id||r.license?.name||t("Недоступно"));row(details,t("Создан"),date(r.created_at));row(details,t("Последнее обновление"),date(r.updated_at));row(details,t("Последний push"),date(r.pushed_at));row(details,t("Ветка по умолчанию"),r.default_branch);row(details,t("Размер репозитория"),(r.size/1024).toFixed(2)+" MB");content.appendChild(details);
 const languages=langsRel.status==="fulfilled"?await langsRel.value.json().catch(()=>({})):null;
 const languageSection=node("section","repo-detail-section");languageSection.appendChild(node("h3","",t("Языки")));
 if(languages&&Object.keys(languages).length){const total=Object.values(languages).reduce((a,b)=>a+b,0)||1;for(const [name,bytes] of Object.entries(languages).sort((a,b)=>b[1]-a[1])){const line=node("div","repo-language-row"),head=node("div","repo-language-top");head.append(node("strong","",name),node("span","",Math.round(bytes/total*100)+"%"));const bar=node("div","repo-language-bar"),fill=node("span");fill.style.width=(bytes/total*100)+"%";bar.appendChild(fill);line.append(head,bar);languageSection.appendChild(line);}}
 else languageSection.appendChild(node("p","repo-detail-muted",t("Нет данных о языках")));content.appendChild(languageSection);
 if(r.topics?.length){const sec=node("section","repo-detail-section");sec.appendChild(node("h3","",t("Темы")));const tags=node("div","repo-topic-list");r.topics.forEach(x=>tags.appendChild(node("span","repo-topic",x)));sec.appendChild(tags);content.appendChild(sec);}
 const latest=releases?.[0],release=node("section","repo-detail-section");release.appendChild(node("h3","",t("Последний релиз")));release.appendChild(node("p","repo-detail-release-name",latest?(latest.name||latest.tag_name):t("Нет опубликованных релизов")));if(latest?.published_at)release.appendChild(node("p","repo-detail-muted",latest.tag_name+" · "+date(latest.published_at)));content.appendChild(release);
 const links=node("div","repo-detail-links");links.append(link(t("Открыть репозиторий"),r.html_url),link(t("Открыть README"),r.html_url+"/blob/"+(r.default_branch||"main")+"/README.md"),link(t("Открыть Issues"),r.html_url+"/issues"),link(t("Открыть Commits"),r.html_url+"/commits"),link(t("Releases"),r.html_url+"/releases"));
 const clone=node("button","repo-detail-link",t("Копировать")+" git clone");clone.type="button";clone.addEventListener("click",async()=>{try{await navigator.clipboard.writeText("git clone "+r.clone_url);clone.textContent=t("Скопировано");}catch{clone.textContent=t("Недоступно");}});links.appendChild(clone);content.appendChild(links);
 $("repo-modal-loading").hidden=true;content.hidden=false;
}
function closeDetails(){detailController?.abort();overlay.hidden=true;overlay.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");activeRepo=null;}
close.addEventListener("click",closeDetails);overlay.addEventListener("click",e=>{if(e.target===overlay)closeDetails();});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!overlay.hidden)closeDetails();});
search.addEventListener("input",render);sort.addEventListener("change",render);retry.addEventListener("click",()=>load(true));document.addEventListener("site:language-change",()=>{render();});
document.addEventListener("keydown",e=>{const x=e.target,typing=x instanceof HTMLElement&&(x.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(x.tagName));if(e.key==="/"&&!typing){e.preventDefault();search.focus();}if(e.key==="Escape"&&document.activeElement===search){search.value="";render();search.blur();}});
if(!cacheRead())load();
})();
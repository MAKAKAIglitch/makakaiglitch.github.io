(() => {
"use strict";
const search=document.getElementById("library-search");
const grid=document.getElementById("library-grid");
const cards=Array.from(grid.querySelectorAll(".library-card"));
const tabs=Array.from(document.querySelectorAll("[data-library-filter]"));
const empty=document.getElementById("library-empty");
const count=document.getElementById("library-count");
let category="all",trackerText="";
function filter() {
 const q=search.value.trim().toLocaleLowerCase("ru"); let shown=0;
 for(const card of cards) {
  const match=(category==="all"||card.dataset.category===category)&&
   (card.dataset.search+" "+card.textContent).toLocaleLowerCase("ru").includes(q);
  card.hidden=!match;if(match)shown++;
 }
 empty.hidden=shown!==0;grid.hidden=shown===0;count.textContent=shown+" / "+cards.length+" ITEMS";
}
for(const tab of tabs) tab.addEventListener("click",()=>{
 category=tab.dataset.libraryFilter||"all";
 for(const item of tabs){const active=item===tab;item.classList.toggle("is-active",active);item.setAttribute("aria-pressed",String(active));}
 filter();
});
const files={best:"trackers_best.txt",all:"trackers_all.txt",udp:"trackers_all_udp.txt",http:"trackers_all_http.txt",https:"trackers_all_https.txt"};
const base="https://raw.githubusercontent.com/ngosang/trackerslist/master/";
const preview=document.getElementById("tracker-preview"),notice=document.getElementById("tracker-status");
const copy=document.getElementById("tracker-copy"),raw=document.getElementById("tracker-raw-link");
function setNotice(message,error=false){notice.textContent=message;notice.dataset.state=error?"error":"success";}
for(const button of document.querySelectorAll("[data-trackers-list]")) button.addEventListener("click",async()=>{
 const file=files[button.dataset.trackersList];if(!file)return;
 button.disabled=true;setNotice("Загружаю список с GitHub…");
 try{
  const response=await fetch(base+file,{cache:"no-cache"});
  if(!response.ok)throw new Error("HTTP "+response.status);
  trackerText=(await response.text()).trim();if(!trackerText)throw new Error("Список пуст");
  preview.textContent=trackerText;raw.href=base+file;copy.disabled=false;
  setNotice("Загружено трекеров: "+trackerText.split(/\r?\n/).filter(Boolean).length+". Источник: "+file);
 }catch(error){setNotice("Не удалось загрузить: "+error.message+". Открой raw-ссылку напрямую.",true);}
 finally{button.disabled=false;}
});
copy.addEventListener("click",async()=>{
 if(!trackerText)return;
 try{await navigator.clipboard.writeText(trackerText);setNotice("Список скопирован.");}
 catch{
  const range=document.createRange();range.selectNodeContents(preview);
  const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
  setNotice("Текст выделен — нажми Ctrl+C.",true);
 }
});
search.addEventListener("input",filter);
document.addEventListener("keydown",event=>{
 const el=event.target,typing=el instanceof HTMLElement&&(el.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(el.tagName));
 if(event.key==="/"&&!typing){event.preventDefault();search.focus();}
 if(event.key==="Escape"&&document.activeElement===search){search.value="";filter();search.blur();}
});
filter();
})();
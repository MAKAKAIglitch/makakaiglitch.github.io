(() => {
  "use strict";
  const grid=document.getElementById("shares-grid");
  const sortSelect=document.getElementById("share-sort");
  const refreshLabel=document.getElementById("share-refresh-label");
  if(!grid||!sortSelect||!refreshLabel)return;
  const cards=Array.from(grid.querySelectorAll("[data-game-id]"));
  const t=s=>window.siteI18n?.t(s)||s;
  const locale=()=>window.siteI18n?.language==="en"?"en-US":"ru-RU";
  const number=value=>new Intl.NumberFormat(locale()).format(value||0);
  function numeric(card,key){
    const raw=card.dataset[key];
    if(raw===undefined||raw==="")return null;
    const value=Number(raw);return Number.isFinite(value)?value:null;
  }
  function sortCards(){
    const mode=sortSelect.value;
    const sorted=[...cards].sort((a,b)=>{
      const aName=a.querySelector(".utility-card-top strong")?.textContent||"";
      const bName=b.querySelector(".utility-card-top strong")?.textContent||"";
      if(mode==="name")return aName.localeCompare(bName,locale());
      const primary=mode==="seeders"?"seeders":"leechers",secondary=mode==="seeders"?"leechers":"seeders";
      const av=numeric(a,primary),bv=numeric(b,primary);
      if(av===null&&bv!==null)return 1;if(bv===null&&av!==null)return -1;
      if(av!==null&&bv!==null&&av!==bv)return bv-av;
      const as=numeric(a,secondary),bs=numeric(b,secondary);
      if(as===null&&bs!==null)return 1;if(bs===null&&as!==null)return -1;
      if(as!==null&&bs!==null&&as!==bs)return bs-as;
      return aName.localeCompare(bName,locale());
    });
    sorted.forEach(card=>grid.appendChild(card));
  }
  function formatUpdated(value){
    if(!value)return null;
    const date=new Date(value);if(Number.isNaN(date.getTime()))return null;
    return new Intl.DateTimeFormat(locale(),{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(date)+" UTC";
  }
  function formatTorrentDate(value){
    if(!value)return null;
    const date=new Date(value);if(Number.isNaN(date.getTime()))return null;
    return new Intl.DateTimeFormat(locale(),{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(date)+" UTC";
  }
  function renderTorrentUpdate(card,item){
    const node=card.querySelector('[data-stat="torrent-updated"]');
    if(!node)return;
    const candidates=[
      {value:item?.torrent_last_modified_at,label:"Последнее изменение файла:",source:"server"},
      {value:item?.torrent_content_changed_at,label:"Изменение обнаружено:",source:"detected"},
      {value:item?.torrent_creation_date,label:"Дата создания торрент-файла:",source:"created"}
    ].map(entry=>({...entry,time:entry.value?new Date(entry.value).getTime():NaN}))
     .filter(entry=>Number.isFinite(entry.time))
     .sort((a,b)=>b.time-a.time);
    if(candidates.length){
      const latest=candidates[0];
      node.textContent=t(latest.label)+" "+formatTorrentDate(latest.value);
      node.dataset.source=latest.source;
      return;
    }
    const firstSeen=formatTorrentDate(item?.torrent_first_seen_at);
    node.textContent=firstSeen
      ?t("Дата изменения пока неизвестна")+" · "+t("Отслеживание с:")+" "+firstSeen
      :t("Дата изменения пока неизвестна");
    node.dataset.source="unknown";
  }
  function renderGame(card,item){
    const seeders=Number.isInteger(item?.seeders)&&item.seeders>=0?item.seeders:null;
    const leechers=Number.isInteger(item?.leechers)&&item.leechers>=0?item.leechers:null;
    const responded=Number.isInteger(item?.trackers_responded)?item.trackers_responded:0;
    const total=Number.isInteger(item?.trackers_total)?item.trackers_total:0;
    card.dataset.seeders=seeders===null?"":String(seeders);
    card.dataset.leechers=leechers===null?"":String(leechers);
    const seedersNode=card.querySelector('[data-stat="seeders"]');
    const leechersNode=card.querySelector('[data-stat="leechers"]');
    const trackersNode=card.querySelector('[data-stat="trackers"]');
    const stateNode=card.querySelector('[data-stat="state"]');
    if(seedersNode)seedersNode.textContent=seeders===null?"—":number(seeders);
    if(leechersNode)leechersNode.textContent=leechers===null?"—":number(leechers);
    if(trackersNode)trackersNode.textContent=total?number(responded)+"/"+number(total):"—";
    if(stateNode){
      if(item?.status==="ok")stateNode.textContent=t("Актуально");
      else if(item?.status==="stale")stateNode.textContent=t("Последние доступные данные");
      else if(total)stateNode.textContent=t("Ожидаем ответ от трекеров");
      else stateNode.textContent=t("Нет данных");
    }
    renderTorrentUpdate(card,item);
  }
  async function loadStats(){
    try{
      const response=await fetch("/data/torrent-stats.json",{cache:"no-store"});
      if(!response.ok)throw Error("HTTP "+response.status);
      const data=await response.json(),games=data&&typeof data.games==="object"?data.games:{};
      cards.forEach(card=>renderGame(card,games[card.dataset.gameId]));
      const updated=formatUpdated(data.generated_at);
      refreshLabel.textContent=updated?t("Проверено:")+" "+updated:t("Первая проверка ещё не выполнена");
      refreshLabel.dataset.state=updated?"ready":"pending";
    }catch(error){
      refreshLabel.textContent=t("Не удалось загрузить статистику")+" ("+error.message+")";
      refreshLabel.dataset.state="error";
    }
    sortCards();
  }
  sortSelect.addEventListener("change",sortCards);
  document.addEventListener("site:language-change",sortCards);
  sortCards();
  loadStats();

})();

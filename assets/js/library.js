(() => {
"use strict";

const search = document.getElementById("library-search");
const grid = document.getElementById("library-grid");
const cards = Array.from(grid.querySelectorAll(".library-card"));
const sectionTabs = Array.from(document.querySelectorAll("[data-library-section]"));
const torrentTabs = Array.from(document.querySelectorAll("button[data-torrent-view]"));
const torrentTabsWrap = document.getElementById("torrent-subtabs-wrap");
const empty = document.getElementById("library-empty");
const count = document.getElementById("library-count");
const sectionTitle = document.getElementById("library-section-title");

let activeSection = "torrents";
let activeTorrentView = "shares";
let trackerText = "";

function activateTab(tabs, selected) {
  for (const tab of tabs) {
    const active = tab === selected;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  }
}

function renderLibrary() {
  const query = search.value.trim().toLocaleLowerCase("ru");
  let visible = 0;

  torrentTabsWrap.hidden = activeSection !== "torrents";

  for (const card of cards) {
    const sectionMatches = activeSection === "all" || card.dataset.section === activeSection;
    const torrentMatches = activeSection !== "torrents" || card.dataset.torrentView === activeTorrentView;
    const searchMatches = (card.dataset.search + " " + card.textContent)
      .toLocaleLowerCase("ru")
      .includes(query);
    const matches = sectionMatches && torrentMatches && searchMatches;

    card.hidden = !matches;
    if (matches) visible += 1;
  }

  grid.hidden = visible === 0;
  empty.hidden = visible !== 0;
  count.textContent = visible + " / " + cards.length + " ITEMS";

  const titles = {
    all: "ALL MATERIALS",
    torrents: activeTorrentView === "shares" ? "TORRENTS / SHARES" : "TORRENTS / TRACKERS",
    guides: "GUIDES",
    notes: "NOTES"
  };
  sectionTitle.textContent = titles[activeSection];
}

for (const tab of sectionTabs) {
  tab.addEventListener("click", () => {
    activeSection = tab.dataset.librarySection || "all";
    if (activeSection === "torrents") activeTorrentView = "shares";
    activateTab(sectionTabs, tab);
    activateTab(torrentTabs, torrentTabs.find((item) => item.dataset.torrentView === activeTorrentView));
    renderLibrary();
  });
}

for (const tab of torrentTabs) {
  tab.addEventListener("click", () => {
    activeTorrentView = tab.dataset.torrentView || "shares";
    activateTab(torrentTabs, tab);
    renderLibrary();
  });
}

const trackerFiles = {
  best: "trackers_best.txt",
  all: "trackers_all.txt",
  udp: "trackers_all_udp.txt",
  http: "trackers_all_http.txt",
  https: "trackers_all_https.txt"
};
const trackerBase = "https://raw.githubusercontent.com/ngosang/trackerslist/master/";
const preview = document.getElementById("tracker-preview");
const trackerStatus = document.getElementById("tracker-status");
const copyButton = document.getElementById("tracker-copy");
const rawLink = document.getElementById("tracker-raw-link");

function setTrackerStatus(message, isError = false) {
  trackerStatus.textContent = message;
  trackerStatus.dataset.state = isError ? "error" : "success";
}

for (const button of document.querySelectorAll("[data-trackers-list]")) {
  button.addEventListener("click", async () => {
    const file = trackerFiles[button.dataset.trackersList];
    if (!file) return;

    button.disabled = true;
    setTrackerStatus("Загружаю список с GitHub…");

    try {
      const response = await fetch(trackerBase + file, { cache: "no-cache" });
      if (!response.ok) throw new Error("GitHub вернул HTTP " + response.status);

      const result = (await response.text()).trim();
      if (!result) throw new Error("Получен пустой список.");

      trackerText = result;
      preview.textContent = trackerText;
      rawLink.href = trackerBase + file;
      copyButton.disabled = false;

      const total = trackerText.split(/\r?\n/).filter(Boolean).length;
      setTrackerStatus("Загружено трекеров: " + total + ". Источник: " + file);
    } catch (error) {
      setTrackerStatus("Не удалось загрузить список: " + error.message + ". Открой raw-ссылку напрямую.", true);
    } finally {
      button.disabled = false;
    }
  });
}

copyButton.addEventListener("click", async () => {
  if (!trackerText) return;

  try {
    await navigator.clipboard.writeText(trackerText);
    setTrackerStatus("Список скопирован в буфер обмена.");
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    setTrackerStatus("Текст выделен — нажми Ctrl+C.", true);
  }
});

search.addEventListener("input", renderLibrary);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !typing) {
    event.preventDefault();
    search.focus();
  }

  if (event.key === "Escape" && document.activeElement === search) {
    search.value = "";
    renderLibrary();
    search.blur();
  }
});

renderLibrary();
})();
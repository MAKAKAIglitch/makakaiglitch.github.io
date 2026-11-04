(() => {
  "use strict";
  const search = document.getElementById("library-search");
  const grid = document.getElementById("library-grid");
  const empty = document.getElementById("library-empty");
  const count = document.getElementById("library-count");
  const sectionTitle = document.getElementById("library-section-title");
  if (!search || !grid || !empty || !count || !sectionTitle) return;

  const cards = Array.from(grid.querySelectorAll(".library-card"));
  const sectionTabs = Array.from(document.querySelectorAll("[data-library-section]"));
  const params = new URLSearchParams(window.location.search);
  const requestedTorrentView = params.get("torrent");
  const validTorrentView = requestedTorrentView === "shares" || requestedTorrentView === "client";
  let activeSection = validTorrentView ? "torrents" : "all";
  let activeTorrentView = validTorrentView ? requestedTorrentView : "shares";
  let trackerText = "";

  function activateTabs(tabs, selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    }
  }

  function renderLibrary() {
    const query = search.value.trim().toLocaleLowerCase("ru");
    let visible = 0;
    for (const card of cards) {
      const sectionMatches = activeSection === "all" ||
        (activeSection === "torrents"
          ? card.dataset.section === "torrents" && card.dataset.torrentView === activeTorrentView
          : card.dataset.section === activeSection);
      const haystack = (card.dataset.search + " " + card.textContent).toLocaleLowerCase("ru");
      const matches = sectionMatches && haystack.includes(query);
      card.hidden = !matches;
      if (matches) visible += 1;
    }
    grid.hidden = visible === 0;
    empty.hidden = visible !== 0;
    count.textContent = visible + " / " + cards.length + " MATERIALS";
    const titles = {
      all: "ALL MATERIALS",
      torrents: activeTorrentView === "shares" ? "TORRENT / SHARES" : "TORRENT / CLIENT SETTINGS",
      guides: "GUIDES",
      notes: "NOTES"
    };
    sectionTitle.textContent = titles[activeSection] || "LIBRARY";
  }

  for (const tab of sectionTabs) {
    tab.addEventListener("click", () => {
      activeSection = tab.dataset.librarySection || "all";
      activateTabs(sectionTabs, tab);
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
    if (!trackerStatus) return;
    trackerStatus.textContent = message;
    trackerStatus.dataset.state = isError ? "error" : "success";
  }
  for (const button of document.querySelectorAll("[data-trackers-list]")) {
    button.addEventListener("click", async () => {
      const file = trackerFiles[button.dataset.trackersList];
      if (!file || !preview || !copyButton || !rawLink) return;
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
  if (copyButton && preview) {
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
  }

  search.addEventListener("input", renderLibrary);
  document.addEventListener("keydown", event => {
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
  const defaultTab = sectionTabs.find(tab => tab.dataset.librarySection === "all");
  activateTabs(sectionTabs, activeSection === "all" ? defaultTab : null);
  renderLibrary();
})();
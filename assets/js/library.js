(() => {
  "use strict";

  const search = document.getElementById("library-search");
  const grid = document.getElementById("library-grid");
  const empty = document.getElementById("library-empty");
  const count = document.getElementById("library-count");
  const sectionTitle = document.getElementById("library-section-title");
  const torrentDropdown = document.getElementById("library-torrent-dropdown");
  const torrentToggle = document.getElementById("library-torrent-toggle");
  const torrentMenu = document.getElementById("library-torrent-menu");

  if (!search || !grid || !empty || !count || !sectionTitle || !torrentDropdown || !torrentToggle || !torrentMenu) return;

  const cards = Array.from(grid.querySelectorAll(".library-card"));
  const mainTabs = Array.from(document.querySelectorAll("button[data-library-section]:not([data-torrent-view])"));
  const torrentTabs = Array.from(document.querySelectorAll("button[data-torrent-view]"));
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("torrent");
  const validView = requestedView === "shares" || requestedView === "client";

  let activeSection = validView ? "torrents" : "all";
  let activeTorrentView = validView ? requestedView : "shares";
  let trackerText = "";

  function activateTabs(tabs, selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    }
  }

  function setTorrentMenu(open) {
    torrentMenu.hidden = !open;
    torrentToggle.setAttribute("aria-expanded", String(open));
    torrentToggle.classList.toggle("is-active", open || activeSection === "torrents");
    torrentToggle.setAttribute("aria-pressed", String(activeSection === "torrents"));
  }

  function updateTorrentUrl(view) {
    const nextUrl = new URL(window.location.href);
    if (view) nextUrl.searchParams.set("torrent", view);
    else nextUrl.searchParams.delete("torrent");
    window.history.replaceState(null, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
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
    torrentToggle.classList.toggle("is-active", !torrentMenu.hidden || activeSection === "torrents");
    torrentToggle.setAttribute("aria-pressed", String(activeSection === "torrents"));
  }

  for (const tab of mainTabs) {
    tab.addEventListener("click", () => {
      activeSection = tab.dataset.librarySection || "all";
      activateTabs(mainTabs, tab);
      setTorrentMenu(false);
      updateTorrentUrl(null);
      renderLibrary();
    });
  }

  for (const tab of torrentTabs) {
    tab.addEventListener("click", () => {
      activeSection = "torrents";
      activeTorrentView = tab.dataset.torrentView || "shares";
      activateTabs(torrentTabs, tab);
      activateTabs(mainTabs, null);
      setTorrentMenu(false);
      updateTorrentUrl(activeTorrentView);
      renderLibrary();
    });
  }

  torrentToggle.addEventListener("click", () => {
    setTorrentMenu(torrentMenu.hidden);
  });

  document.addEventListener("click", event => {
    if (!torrentMenu.hidden && !torrentDropdown.contains(event.target)) {
      setTorrentMenu(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !torrentMenu.hidden) {
      setTorrentMenu(false);
      torrentToggle.focus();
    }
  });

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

  activateTabs(mainTabs, mainTabs.find(tab => tab.dataset.librarySection === activeSection));
  activateTabs(torrentTabs, activeSection === "torrents" ? torrentTabs.find(tab => tab.dataset.torrentView === activeTorrentView) : null);
  setTorrentMenu(false);
  renderLibrary();
})();
(() => {
  "use strict";

  const launcher = document.getElementById("torrent-launcher");
  const workspace = document.getElementById("torrent-workspace");
  const viewTabs = Array.from(document.querySelectorAll("[data-torrent-view]"));
  const viewPanels = Array.from(document.querySelectorAll("[data-torrent-panel]"));
  const placeholder = document.getElementById("torrent-placeholder");

  if (!launcher || !workspace || !placeholder) return;

  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("torrent");
  const validView = requestedView === "shares" || requestedView === "client";
  let activeView = null;
  let trackerText = "";

  function updateTorrentUrl(view) {
    const nextUrl = new URL(window.location.href);
    if (view) nextUrl.searchParams.set("torrent", view);
    else nextUrl.searchParams.delete("torrent");
    window.history.replaceState(null, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
  }

  function setExpanded(expanded) {
    workspace.hidden = !expanded;
    launcher.setAttribute("aria-expanded", String(expanded));
    launcher.classList.toggle("is-expanded", expanded);
    if (!expanded) {
      selectView(null);
      updateTorrentUrl(null);
    }
  }

  function selectView(view) {
    activeView = view;
    for (const tab of viewTabs) {
      const active = tab.dataset.torrentView === view;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    }
    for (const panel of viewPanels) {
      panel.hidden = panel.dataset.torrentPanel !== view;
    }
    placeholder.hidden = Boolean(view);
  }

  launcher.addEventListener("click", () => {
    setExpanded(workspace.hidden);
  });

  for (const tab of viewTabs) {
    tab.addEventListener("click", () => {
      const view = tab.dataset.torrentView;
      if (view !== "shares" && view !== "client") return;
      selectView(view);
      updateTorrentUrl(view);
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !workspace.hidden) {
      setExpanded(false);
      launcher.focus();
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
  const trackerButtons = Array.from(document.querySelectorAll("[data-trackers-list]"));

  function setTrackerStatus(message, isError = false) {
    if (!trackerStatus) return;
    trackerStatus.textContent = message;
    trackerStatus.dataset.state = isError ? "error" : "success";
  }

  for (const button of trackerButtons) {
    button.addEventListener("click", async () => {
      const file = trackerFiles[button.dataset.trackersList];
      if (!file || !preview || !copyButton || !rawLink) return;

      for (const filterButton of trackerButtons) {
        const active = filterButton === button;
        filterButton.classList.toggle("is-active", active);
        filterButton.setAttribute("aria-pressed", String(active));
        filterButton.disabled = true;
      }
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
        trackerText = "";
        preview.textContent = "";
        copyButton.disabled = true;
        setTrackerStatus("Не удалось загрузить список: " + error.message + ". Открой raw-ссылку напрямую.", true);
      } finally {
        for (const filterButton of trackerButtons) filterButton.disabled = false;
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

  if (validView) {
    setExpanded(true);
    selectView(requestedView);
  } else {
    selectView(null);
  }
})();
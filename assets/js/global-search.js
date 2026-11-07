(() => {
  "use strict";
  const PAGE_PATHS = [
    "/", "/tools/", "/tools/warp-generator/", "/tools/magnet-to-torrent/",
    "/tools/ip-check/", "/tools/dns-lookup/", "/tools/dns-tester/", "/tools/download-time/", "/tools/vpn-leak-test/", "/tools/ip-intelligence/", "/library/", "/library/torrent/", "/library/torrent/shares/", "/library/torrent/client/", "/minecraft/", "/minecraft/tabby/", "/minecraft/savewatch/"
  ];
  const REPOSITORY_SNAPSHOT = "/data/repositories.json";
  const MINECRAFT_CATALOG = "/data/minecraft-mods.json";
  const CACHE_KEY = "makakaiglitch.global-search.v9";
  const CACHE_TTL = 5 * 60 * 1000;
  const MAX_RESULTS = 12;
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  const githubLink = topbar.querySelector(".github-link");
  const actions = document.createElement("div");
  actions.className = "topbar-actions";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "global-search-trigger";
  trigger.setAttribute("aria-label", "Глобальный поиск по сайту");
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 4.2 4.2"></path></svg><span class="global-search-label">Поиск</span><kbd>Ctrl K</kbd>';
  if (githubLink) {
    topbar.insertBefore(actions, githubLink);
    actions.append(trigger, githubLink);
  } else {
    topbar.appendChild(actions);
    actions.appendChild(trigger);
  }

  const overlay = document.createElement("div");
  overlay.className = "global-search-overlay";
  overlay.hidden = true;
  overlay.innerHTML = '<section class="global-search-dialog" role="dialog" aria-modal="true" aria-label="Глобальный поиск"><div class="global-search-head"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 4.2 4.2"></path></svg><input class="global-search-input" type="search" placeholder="Искать по всему сайту..." autocomplete="off" spellcheck="false"><button class="global-search-close" type="button">Esc</button></div><div class="global-search-meta" aria-live="polite">ПОИСК ПО ВСЕМУ САЙТУ</div><div class="global-search-results"><div class="global-search-empty">Введи запрос: проект, утилита, торрент, трекер или тему.</div></div></section>';
  document.body.appendChild(overlay);
  const input = overlay.querySelector(".global-search-input");
  const closeButton = overlay.querySelector(".global-search-close");
  const meta = overlay.querySelector(".global-search-meta");
  const results = overlay.querySelector(".global-search-results");
  let searchItems = [];
  let indexPromise = null;
  let previousFocus = null;
  let isIndexed = false;

  function normalize(value) {
    return String(value || "").toLocaleLowerCase("ru").replace(/ё/g, "е")
      .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  }
  function createItem(title, description, href, type, keywords) {
    return {
      title: String(title || "Без названия").trim(),
      description: String(description || "").replace(/\s+/g, " ").trim().slice(0, 260),
      href: href || "/", type: type || "Материал",
      searchable: normalize([title, description, keywords].join(" "))
    };
  }
  function safeLocalHref(href, fallback) {
    try {
      const url = new URL(href || fallback || "/", location.origin);
      if (url.origin !== location.origin) return fallback || "/";
      return url.pathname + url.search + url.hash;
    } catch { return fallback || "/"; }
  }
  function addPageRecords(html, path) {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    parsed.querySelectorAll("script, style, nav, header, footer, .toolbar, .global-search-overlay").forEach(node => node.remove());
    const main = parsed.querySelector("main") || parsed.body;
    const pageTitle = parsed.title || main.querySelector("h1")?.textContent || path;
    const pageDescription = parsed.querySelector('meta[name="description"]')?.content || "";
    const heading = main.querySelector("h1")?.textContent || pageTitle;
    const mainText = (main.textContent || "").replace(/\s+/g, " ").trim();
    searchItems.push(createItem(pageTitle, [pageDescription, mainText].join(" "), path, "Страница", heading));
    const blocks = main.querySelectorAll(".utility-card, .library-card, .repo-card, .tool-detail-card, .warp-panel");
    for (const block of blocks) {
      const title = block.querySelector("h2, h3, strong")?.textContent || block.querySelector("a")?.textContent || pageTitle;
      const description = block.textContent || "";
      const link = block.matches("a[href]") ? block.getAttribute("href") : block.querySelector('a[href^="/"]')?.getAttribute("href");
      const keywords = [
        block.getAttribute("data-search"), block.getAttribute("data-category"),
        block.getAttribute("data-section"), block.getAttribute("data-torrent-view")
      ].filter(Boolean).join(" ");
      const type = path.includes("/minecraft/") ? "Minecraft" : path.includes("/library") ? "Library" : path.includes("/tools") ? "Utilities" : "Материал";
      searchItems.push(createItem(title, description, safeLocalHref(link, path), type, keywords));
    }
  }
  async function fetchPage(path) {
    try {
      const response = await fetch(path, { cache: "force-cache" });
      if (response.ok) addPageRecords(await response.text(), path);
    } catch { /* Other pages remain searchable. */ }
  }
  async function fetchRepositories() {
    try {
      const response = await fetch(REPOSITORY_SNAPSHOT, { cache: "force-cache" });
      if (!response.ok) return;
      const payload = await response.json();
      const repos = Array.isArray(payload) ? payload : payload.items;
      if (!Array.isArray(repos)) return;
      for (const repo of repos) {
        if (!repo || repo.owner?.login?.toLowerCase() !== "makakaiglitch") continue;
        searchItems.push(createItem(
          repo.name,
          [repo.description || "", repo.language || "", repo.parent?.full_name || "", ...(Array.isArray(repo.topics) ? repo.topics : [])].join(" "),
          repo.html_url, "GitHub", "repository repositories репозиторий проект исходный код releases релизы fork forks форк форки"
        ));
      }
    } catch { /* Static page records remain searchable. */ }
  }
  async function fetchMinecraftProjects() {
    try {
      const response = await fetch(MINECRAFT_CATALOG, { cache: "force-cache" });
      if (!response.ok) return;
      const payload = await response.json();
      if (!Array.isArray(payload.items)) return;
      for (const project of payload.items) {
        if (!project || !/^[a-z0-9-]+$/.test(project.slug || "")) continue;
        searchItems.push(createItem(
          project.name?.ru || project.name?.en || project.slug,
          [
            project.summary?.ru || "", project.summary?.en || "",
            project.loader || "", ...(project.minecraft_versions || []),
            ...(project.features || []).flatMap(feature => [feature.ru || "", feature.en || ""])
          ].join(" "),
          "/minecraft/" + encodeURIComponent(project.slug) + "/",
          "Minecraft",
          "minecraft mod mods fabric forge neoforge java edition issue pull request"
        ));
      }
    } catch { /* Search remains available without the Minecraft catalog. */ }
  }
  function emptyResult(message) {
    const node = document.createElement("div");
    node.className = "global-search-empty";
    node.textContent = message;
    return node;
  }
  function render(query) {
    const normalized = normalize(query);
    results.replaceChildren();
    if (!normalized) {
      results.appendChild(emptyResult("Введи запрос: проект, утилита, торрент, трекер или тему."));
      return;
    }
    if (!isIndexed) {
      results.appendChild(emptyResult("Индексирую страницы сайта…"));
      return;
    }
    const terms = normalized.split(" ").filter(Boolean);
    const ranked = searchItems.map(item => {
      let score = 0, matchedTerms = 0;
      const titleText = normalize(item.title), descriptionText = normalize(item.description);
      for (const term of terms) {
        let matched = false;
        if (titleText.includes(term)) { score += 8; matched = true; }
        if (item.searchable.includes(term)) { score += 2; matched = true; }
        if (descriptionText.includes(term)) { score += 1; matched = true; }
        if (matched) matchedTerms += 1;
      }
      return { item, score, matchedTerms };
    }).filter(result => result.matchedTerms === terms.length)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, "ru"))
      .slice(0, MAX_RESULTS);
    if (!ranked.length) {
      results.appendChild(emptyResult("Ничего не найдено. Попробуй другое название или ключевое слово."));
      meta.textContent = "0 РЕЗУЛЬТАТОВ";
      return;
    }
    for (const { item } of ranked) {
      const link = document.createElement("a");
      link.className = "global-search-result";
      link.href = item.href;
      const top = document.createElement("span");
      top.className = "global-search-result-top";
      const title = document.createElement("span");
      title.className = "global-search-result-title";
      title.textContent = item.title;
      const type = document.createElement("span");
      type.className = "global-search-result-type";
      type.textContent = item.type;
      top.append(title, type);
      const description = document.createElement("span");
      description.className = "global-search-result-description";
      description.textContent = item.description;
      link.append(top, description);
      results.appendChild(link);
    }
    meta.textContent = ranked.length + " РЕЗУЛЬТАТОВ · ПОИСК ПО ВСЕМУ САЙТУ";
  }
  async function buildIndex() {
    if (isIndexed) return;
    if (indexPromise) return indexPromise;
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && Array.isArray(cached.items) && Date.now() - cached.savedAt < CACHE_TTL) {
        searchItems = cached.items;
        isIndexed = true;
        meta.textContent = "ГОТОВО · " + searchItems.length + " МАТЕРИАЛОВ";
        render(input.value);
        return;
      }
    } catch { /* Session storage is optional. */ }
    meta.textContent = "ИНДЕКСИРУЮ СТРАНИЦЫ И РЕПОЗИТОРИИ…";
    indexPromise = Promise.all([Promise.all(PAGE_PATHS.map(fetchPage)), fetchRepositories(), fetchMinecraftProjects()]).then(() => {
      isIndexed = true;
      meta.textContent = "ГОТОВО · " + searchItems.length + " МАТЕРИАЛОВ";
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ items: searchItems, savedAt: Date.now() })); }
      catch { /* Search works without storage. */ }
      render(input.value);
    }).catch(() => {
      meta.textContent = "ПОИСК ПО ДОСТУПНЫМ СТРАНИЦАМ";
      render(input.value);
    });
    return indexPromise;
  }
  function openSearch() {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    render("");
    buildIndex();
    requestAnimationFrame(() => input.focus());
  }
  function closeSearch() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  }
  trigger.addEventListener("click", openSearch);
  closeButton.addEventListener("click", closeSearch);
  overlay.addEventListener("click", event => { if (event.target === overlay) closeSearch(); });
  input.addEventListener("input", () => { render(input.value); if (!isIndexed) buildIndex(); });
  document.addEventListener("keydown", event => {
    const target = event.target;
    const typing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    const slash = event.key === "/" && !typing;
    if (!overlay.hidden && event.key === "Escape") {
      event.preventDefault(); closeSearch(); return;
    }
    if (shortcut || slash) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (overlay.hidden) openSearch(); else input.focus();
    }
  }, true);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const first = results.querySelector("a.global-search-result");
      if (first) location.href = first.href;
    }
  });
})();


/* Global ambient cursor light — shared by every page using global-search.js. */
(() => {
  "use strict";
  function initSiteCursorGlow() {
    if (!document.body) return;
    let glow = document.querySelector(".cursor-glow");
    if (!glow) {
      glow = document.createElement("div");
      glow.className = "cursor-glow";
      glow.setAttribute("aria-hidden", "true");
      document.body.insertBefore(glow, document.body.firstChild);
    }

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    let frameId = 0, hasPosition = false;

    function animate() {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.065;
      currentY += dy * 0.065;
      glow.style.transform = "translate3d(" + currentX + "px," + currentY + "px,0) translate(-50%,-50%)";
      if (Math.abs(dx) + Math.abs(dy) > 0.18) {
        frameId = requestAnimationFrame(animate);
      } else {
        frameId = 0;
      }
    }

    function onMouseMove(event) {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasPosition) {
        currentX = targetX;
        currentY = targetY;
        hasPosition = true;
      }
      glow.classList.add("is-visible");
      if (!frameId) frameId = requestAnimationFrame(animate);
    }

    function hideGlow() {
      glow.classList.remove("is-visible");
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("blur", hideGlow);
    window.addEventListener("mouseleave", hideGlow);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hideGlow();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteCursorGlow, { once: true });
  } else {
    initSiteCursorGlow();
  }
})();

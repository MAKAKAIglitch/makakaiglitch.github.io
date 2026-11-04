(() => {
  "use strict";

  const OWNER = "MAKAKAIglitch";
  const API_URL = "https://api.github.com/users/" + OWNER +
    "/repos?type=owner&sort=updated&direction=desc&per_page=100";
  const CACHE_KEY = "makakaiglitch.repositories.v1";
  const CACHE_TTL = 5 * 60 * 1000;

  const grid = document.getElementById("repository-grid");
  const count = document.getElementById("repository-count");
  const search = document.getElementById("repository-search");
  const sort = document.getElementById("repository-sort");
  const emptyState = document.getElementById("empty-state");
  const errorState = document.getElementById("error-state");
  const errorMessage = document.getElementById("error-message");
  const retryButton = document.getElementById("retry-button");
  const lastUpdated = document.getElementById("last-updated");

  let repositories = [];
  let requestController = null;

  const icons = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.75 5.58 6.16.9-4.46 4.35 1.05 6.14L12 17.07l-5.5 2.9 1.05-6.14L3.1 9.48l6.15-.9L12 3Z"/></svg>',
    fork: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v3a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4M18 7v2"/></svg>',
    external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>'
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("ru-RU").format(value || 0);
  }

  function formatDate(value) {
    if (!value) return "дата неизвестна";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "дата неизвестна";
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function makeMeta(className, label, iconMarkup) {
    const item = element("span", "meta-item " + className);
    if (iconMarkup) item.insertAdjacentHTML("afterbegin", iconMarkup);
    item.appendChild(document.createTextNode(label));
    return item;
  }

  function createRepositoryCard(repo) {
    const card = element("article", "repo-card");
    const top = element("div", "repo-card-top");
    const titleWrap = element("div", "repo-title-wrap");
    const name = element("a", "repo-name", repo.name);
    name.href = repo.html_url;
    name.target = "_blank";
    name.rel = "noopener noreferrer";

    const labels = element("div", "repo-labels");
    if (repo.fork) labels.appendChild(element("span", "repo-label", "FORK"));
    if (repo.archived) labels.appendChild(element("span", "repo-label", "ARCHIVED"));

    titleWrap.append(name);
    if (labels.childElementCount) titleWrap.appendChild(labels);

    const external = element("a", "repo-external");
    external.href = repo.html_url;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    external.setAttribute("aria-label", "Открыть " + repo.name + " на GitHub");
    external.insertAdjacentHTML("afterbegin", icons.external);
    top.append(titleWrap, external);

    const description = element(
      "p",
      "repo-description" + (repo.description ? "" : " is-empty"),
      repo.description || "Описание пока не добавлено."
    );

    const meta = element("div", "repo-meta");
    if (repo.language) {
      const language = element("span", "meta-item");
      language.appendChild(element("span", "language-dot"));
      language.appendChild(document.createTextNode(repo.language));
      meta.appendChild(language);
    }
    meta.appendChild(makeMeta("meta-stars", formatNumber(repo.stargazers_count) + " stars", icons.star));
    meta.appendChild(makeMeta("meta-forks", formatNumber(repo.forks_count) + " forks", icons.fork));
    meta.appendChild(makeMeta("meta-updated", "Обновлён " + formatDate(repo.updated_at)));

    card.append(top, description, meta);
    return card;
  }

  function render() {
    const query = search.value.trim().toLocaleLowerCase("ru");
    const filtered = repositories.filter((repo) => {
      const searchable = [
        repo.name,
        repo.description || "",
        repo.language || "",
        ...(Array.isArray(repo.topics) ? repo.topics : [])
      ].join(" ").toLocaleLowerCase("ru");
      return searchable.includes(query);
    });

    const mode = sort.value;
    filtered.sort((a, b) => {
      if (mode === "stars") return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (mode === "name") return a.name.localeCompare(b.name, "ru", { sensitivity: "base" });
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });

    grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const repo of filtered) fragment.appendChild(createRepositoryCard(repo));
    grid.appendChild(fragment);

    count.textContent = query
      ? formatNumber(filtered.length) + " из " + formatNumber(repositories.length) + " репозиториев"
      : formatNumber(repositories.length) + " репозиториев";

    emptyState.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;
  }

  function readCache() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && Array.isArray(cached.items)) {
        repositories = cached.items.filter((repo) =>
          repo &&
          repo.owner &&
          typeof repo.owner.login === "string" &&
          repo.owner.login.toLowerCase() === OWNER.toLowerCase() &&
          repo.fork === false
        );
        render();
        lastUpdated.textContent = cached.savedAt
          ? "Кэш обновлён " + formatDate(cached.savedAt)
          : "Данные из кэша";
        return Date.now() - cached.timestamp < CACHE_TTL;
      }
    } catch {
      try { sessionStorage.removeItem(CACHE_KEY); } catch { /* Storage may be disabled. */ }
    }
    return false;
  }

  async function loadRepositories(force = false) {
    errorState.hidden = true;
    if (!repositories.length) {
      grid.hidden = false;
      grid.replaceChildren();
      const loading = element("div", "loading-card");
      loading.append(element("span", "spinner"), element("span", "", "Получаем список с GitHub"));
      grid.appendChild(loading);
    }

    if (requestController) requestController.abort();
    requestController = new AbortController();

    try {
      const response = await fetch(API_URL, {
        headers: { Accept: "application/vnd.github+json" },
        signal: requestController.signal,
        cache: force ? "no-store" : "default"
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error("GitHub временно ограничил количество запросов. Попробуй немного позже.");
        }
        throw new Error("GitHub API вернул ошибку " + response.status + ".");
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("GitHub вернул неожиданный формат данных.");

      repositories = data.filter((repo) =>
        repo &&
        repo.owner &&
        typeof repo.owner.login === "string" &&
        repo.owner.login.toLowerCase() === OWNER.toLowerCase() &&
        repo.fork === false &&
        typeof repo.name === "string" &&
        typeof repo.html_url === "string" &&
        repo.html_url.startsWith("https://github.com/")
      );

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          items: repositories,
          timestamp: Date.now(),
          savedAt: new Date().toISOString()
        }));
      } catch {
        // The page still works when browser storage is unavailable.
      }

      render();
      lastUpdated.textContent = "Обновлено " + new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date());
    } catch (error) {
      if (error.name === "AbortError") return;
      if (repositories.length) {
        lastUpdated.textContent = "Показаны сохранённые данные; обновить не удалось";
        return;
      }
      grid.hidden = true;
      errorMessage.textContent = error.message || "Проверь подключение и попробуй ещё раз.";
      errorState.hidden = false;
      count.textContent = "Репозитории недоступны";
    }
  }

  search.addEventListener("input", render);
  sort.addEventListener("change", render);
  retryButton.addEventListener("click", () => loadRepositories(true));

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
      render();
      search.blur();
    }
  });

  readCache();
  loadRepositories();
})();

(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const slug = document.body.dataset.minecraftProject;
  const content = $("minecraft-project-content");
  const loading = $("minecraft-project-loading");
  const error = $("minecraft-project-error");
  if (!slug || !content) return;

  let project = null;
  let language = () => window.siteI18n?.language === "en" ? "en" : "ru";
  function text(value) {
    if (value && typeof value === "object") return value[language()] || value.ru || value.en || "";
    return value == null ? "" : String(value);
  }
  function node(tag, className, value) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value !== undefined) item.textContent = value;
    return item;
  }
  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch { return ""; }
  }
  function externalLink(label, href, className) {
    const url = safeUrl(href);
    if (!url) return null;
    const link = node("a", className || "minecraft-button minecraft-button-secondary", label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  function setSideLink(id, label, href) {
    const link = $(id);
    const url = safeUrl(href);
    if (!link) return;
    if (!url) { link.hidden = true; return; }
    link.href = url;
    link.textContent = label;
    link.hidden = false;
  }
  function appendLocalizedList(target, items, className) {
    target.replaceChildren();
    (items || []).forEach(value => target.appendChild(node("li", className || "", text(value))));
  }
  function render() {
    if (!project) return;
    document.title = text(project.name) + " — Minecraft Projects — MAKAKAIglitch";
    $("project-name").textContent = text(project.name);
    $("project-summary").textContent = text(project.summary);
    $("project-monogram").textContent = project.monogram || "MC";

    const badges = $("project-badges");
    badges.replaceChildren();
    badges.appendChild(node("span", "minecraft-badge " + (project.status === "released" ? "is-released" : "is-development"), text(project.status_label)));
    badges.appendChild(node("span", "minecraft-badge", project.loader));
    (project.minecraft_versions || []).forEach(version => badges.appendChild(node("span","minecraft-badge","Minecraft " + version)));

    const actions = $("project-actions");
    actions.replaceChildren();
    if (project.download_url) {
      const download = externalLink(text({ru:"Скачать .jar",en:"Download .jar"}) + " ↓", project.download_url, "minecraft-button minecraft-button-primary");
      if (download) actions.appendChild(download);
    } else {
      const build = externalLink(text({ru:"Исходный код и сборка",en:"Source code & build"}), project.repo_url + "/blob/main/README.md", "minecraft-button minecraft-button-primary");
      if (build) actions.appendChild(build);
    }
    const source = externalLink(text({ru:"Исходный код",en:"Source code"}) + " ↗", project.repo_url, "minecraft-button minecraft-button-secondary");
    const report = externalLink(text({ru:"Сообщить о проблеме",en:"Report an issue"}) + " ↗", project.new_issue_url, "minecraft-button minecraft-button-secondary");
    if (source) actions.appendChild(source);
    if (report) actions.appendChild(report);

    $("project-overview").textContent = text(project.overview);
    appendLocalizedList($("project-features"), project.features);
    appendLocalizedList($("project-installation"), project.installation?.[language()]);
    appendLocalizedList($("project-limitations"), project.limitations);

    const compatibility = $("project-compatibility");
    compatibility.replaceChildren();
    (project.compatibility || []).forEach(item => {
      const row = node("div", "minecraft-compat-row");
      row.append(node("span","minecraft-compat-label",item.label), node("strong","minecraft-compat-value",item.value));
      compatibility.appendChild(row);
    });

    $("project-version").textContent = project.status === "released"
      ? "v" + project.version
      : (project.version ? "v" + project.version + " · " : "") + text({ru:"без релиза",en:"unreleased"});
    $("project-release-notes").textContent = text(project.release_notes);
    setSideLink("project-author-link", text({ru:"Автор: " + (project.author_name || "GitHub"),en:"Author: " + (project.author_name || "GitHub")}) + " ↗", project.author_url);
    setSideLink("project-source-link", text({ru:"Репозиторий ↗",en:"Repository ↗"}), project.repo_url);
    setSideLink("project-issues-link", text({ru:"Issues ↗",en:"Issues ↗"}), project.issues_url);

    const checksumCard = $("project-checksum-card");
    if (project.sha256) {
      $("project-sha256").textContent = project.sha256;
      checksumCard.hidden = false;
    } else checksumCard.hidden = true;

    loading.hidden = true;
    error.hidden = true;
    content.hidden = false;
  }

  async function loadDownloadCount() {
    const card = $("project-downloads-card");
    const count = $("project-download-count");
    const note = $("project-download-note");
    if (!card || !count || !note || slug !== "rusify" || !project?.repo_url) return;

    card.hidden = false;
    count.textContent = "—";
    note.textContent = text({
      ru: "Загружаю статистику GitHub…",
      en: "Loading GitHub download statistics…"
    });

    try {
      const repoUrl = new URL(project.repo_url);
      if (repoUrl.hostname !== "github.com") throw new Error("Unsupported repository host");
      const repoPath = repoUrl.pathname.endsWith("/") ? repoUrl.pathname.slice(0, -1) : repoUrl.pathname;
      const apiUrl = "https://api.github.com/repos" + repoPath + "/releases?per_page=100";
      const response = await fetch(apiUrl, {
        headers: { "Accept": "application/vnd.github+json" },
        cache: "default"
      });
      if (!response.ok) throw new Error("GitHub API HTTP " + response.status);

      const releases = await response.json();
      if (!Array.isArray(releases)) throw new Error("Invalid GitHub releases response");

      const jarPrefix = project.slug.toLowerCase() + "-";
      const jarAssets = releases.flatMap(release =>
        (Array.isArray(release.assets) ? release.assets : [])
          .filter(asset => {
            const name = typeof asset.name === "string" ? asset.name.toLowerCase() : "";
            return name.startsWith(jarPrefix) && name.endsWith(".jar");
          })
      );
      const total = jarAssets.reduce((sum, asset) =>
        sum + (Number.isFinite(asset.download_count) ? asset.download_count : 0), 0
      );

      count.textContent = new Intl.NumberFormat(language() === "en" ? "en-US" : "ru-RU").format(total);
      note.textContent = text({
        ru: "Сумма скачиваний JAR-файлов всех релизов. Это не число уникальных людей.",
        en: "Combined JAR downloads across all releases. This is not a count of unique people."
      });
    } catch (err) {
      count.textContent = "—";
      note.textContent = text({
        ru: "Не удалось получить статистику GitHub. Попробуй обновить страницу позже.",
        en: "GitHub statistics are unavailable. Please try again later."
      });
      console.warn("Rusify download counter:", err);
    }
  }

  async function load() {
    try {
      const response = await fetch("/data/minecraft-mods.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      project = payload.items?.find(item => item.slug === slug);
      if (!project) throw new Error("Unknown Minecraft project: " + slug);
      render();
      void loadDownloadCount();
    } catch (err) {
      loading.hidden = true;
      error.hidden = false;
      console.error("Minecraft project page:", err);
    }
  }
  document.addEventListener("site:language-change", () => {
    render();
    void loadDownloadCount();
  });
  load();
})();
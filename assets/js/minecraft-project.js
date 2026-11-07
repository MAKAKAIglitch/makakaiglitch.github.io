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
    setSideLink("project-release-link", text({ru:"Все релизы ↗",en:"All releases ↗"}), project.releases_url);
    setSideLink("project-source-link", text({ru:"Репозиторий ↗",en:"Repository ↗"}), project.repo_url);
    setSideLink("project-issues-link", text({ru:"Все Issues ↗",en:"All issues ↗"}), project.issues_url);
    setSideLink("project-new-issue-link", text({ru:"Создать Issue ↗",en:"Create an issue ↗"}), project.new_issue_url);
    setSideLink("project-pulls-link", text({ru:"Все Pull Requests ↗",en:"All pull requests ↗"}), project.pulls_url);
    setSideLink("project-compare-link", text({ru:"Создать Pull Request ↗",en:"Create a pull request ↗"}), project.compare_url);

    const checksumCard = $("project-checksum-card");
    if (project.sha256) {
      $("project-sha256").textContent = project.sha256;
      checksumCard.hidden = false;
    } else checksumCard.hidden = true;

    loading.hidden = true;
    error.hidden = true;
    content.hidden = false;
  }

  async function load() {
    try {
      const response = await fetch("/data/minecraft-mods.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      project = payload.items?.find(item => item.slug === slug);
      if (!project) throw new Error("Unknown Minecraft project: " + slug);
      render();
    } catch (err) {
      loading.hidden = true;
      error.hidden = false;
      console.error("Minecraft project page:", err);
    }
  }
  document.addEventListener("site:language-change", render);
  load();
})();
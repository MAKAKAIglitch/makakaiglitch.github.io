(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const grid = $("minecraft-grid");
  if (!grid) return;

  const search = $("minecraft-search");
  const loaderFilter = $("minecraft-loader-filter");
  const typeFilter = $("minecraft-type-filter");
  const count = $("minecraft-count");
  const empty = $("minecraft-empty");
  const error = $("minecraft-error");
  const retry = $("minecraft-retry");
  let projects = [];
  let language = () => window.siteI18n?.language === "en" ? "en" : "ru";

  function localized(value) {
    if (value && typeof value === "object") return value[language()] || value.ru || value.en || "";
    return value == null ? "" : String(value);
  }
  function normalize(value) {
    return String(value || "").toLocaleLowerCase(language() === "en" ? "en" : "ru")
      .replace(/ё/g, "е").normalize("NFKC");
  }
  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    return node;
  }
  function badge(value, kind) {
    return element("span", "minecraft-badge" + (kind ? " is-" + kind : ""), value);
  }
  function card(project) {
    const link = element("a", "minecraft-card");
    link.href = "/minecraft/" + encodeURIComponent(project.slug) + "/";
    link.setAttribute("aria-label", localized(project.name) + " — " + localized(project.summary));

    const top = element("div", "minecraft-card-top");
    const mark = element("span", "minecraft-card-mark", project.monogram || "MC");
    mark.setAttribute("aria-hidden", "true");
    const identity = element("div", "minecraft-card-identity");
    identity.append(
      element("span", "minecraft-card-kind", localized(project.type_label)),
      element("h2", "minecraft-card-title", localized(project.name))
    );
    top.append(mark, identity);

    const status = badge(localized(project.status_label), project.status === "released" ? "released" : "development");
    const summary = element("p", "minecraft-card-summary", localized(project.summary));
    const tags = element("div", "minecraft-card-tags");
    tags.appendChild(badge(project.loader || "Minecraft"));
    (project.minecraft_versions || []).forEach(version => tags.appendChild(badge("MC " + version)));
    const footer = element("div", "minecraft-card-footer");
    footer.append(element("span", "minecraft-card-version", project.status === "released" ? "v" + project.version : localized({ru:"Исходный код",en:"Source code"})));
    footer.append(element("span", "minecraft-card-more", localized({ru:"Подробнее",en:"Project details"}) + " ↗"));
    link.append(top, status, summary, tags, footer);
    return link;
  }
  function render() {
    const query = normalize(search.value.trim());
    const loader = loaderFilter.value;
    const type = typeFilter.value;
    const filtered = projects.filter(project => {
      const haystack = normalize([
        project.name?.ru, project.name?.en, project.slug,
        project.summary?.ru, project.summary?.en,
        project.loader, project.type, ...(project.minecraft_versions || []),
        ...(project.features || []).flatMap(feature => [feature.ru, feature.en])
      ].join(" "));
      return (!query || haystack.includes(query)) &&
        (loader === "all" || normalize(project.loader) === loader) &&
        (type === "all" || project.type === type);
    }).sort((a,b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));

    grid.replaceChildren(...filtered.map(card));
    grid.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
    count.textContent = filtered.length + (query || loader !== "all" || type !== "all" ? " / " + projects.length : "") +
      " " + localized({ru:"проектов",en:"projects"});
  }
  async function load() {
    error.hidden = true;
    grid.hidden = false;
    grid.replaceChildren(element("div", "minecraft-loading", localized({ru:"Загружаю каталог проектов…",en:"Loading project catalog…"})));
    try {
      const response = await fetch("/data/minecraft-mods.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const payload = await response.json();
      if (!Array.isArray(payload.items)) throw new Error("Invalid catalog format");
      projects = payload.items.filter(item => item && /^[a-z0-9-]+$/.test(item.slug || ""));
      render();
      if (!projects.length) throw new Error("The catalog contains no projects");
    } catch (err) {
      grid.hidden = true;
      error.hidden = false;
      count.textContent = localized({ru:"Каталог недоступен",en:"Catalog unavailable"});
      console.error("Minecraft catalog:", err);
    }
  }

  search.addEventListener("input", render);
  loaderFilter.addEventListener("change", render);
  typeFilter.addEventListener("change", render);
  retry.addEventListener("click", load);
  document.addEventListener("site:language-change", () => { if (projects.length) render(); });
  load();
})();
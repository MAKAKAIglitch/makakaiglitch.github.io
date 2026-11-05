(() => {
  "use strict";
  const t = value => window.siteI18n?.t(value) || value;

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.style.pointerEvents = "none";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    area.remove();
    if (!ok) throw new Error("clipboard unavailable");
    return true;
  }

  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-copy-target]");
    if (!button) return;
    const target = document.getElementById(button.dataset.copyTarget);
    const status = button.parentElement.querySelector(".windows-copy-state");
    if (!target) return;
    const command = target.innerText.trim();
    button.disabled = true;
    if (status) { status.textContent = ""; status.dataset.state = ""; }
    try {
      await copyText(command);
      if (status) status.textContent = t("Скопировано");
    } catch (_) {
      if (status) {
        status.textContent = t("Не удалось скопировать команду.");
        status.dataset.state = "error";
      }
    } finally {
      button.disabled = false;
    }
  });

  const search = document.getElementById("windows-command-search");
  if (search) {
    const cards = Array.from(document.querySelectorAll("[data-windows-command]"));
    const count = document.getElementById("windows-search-count");
    const update = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const match = !query || card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible++;
      });
      if (count) count.textContent = query
        ? t("Показано команд: ") + visible
        : t("Все команды") + " (" + visible + ")";
      document.querySelectorAll(".windows-command-section").forEach(section => {
        section.hidden = !section.querySelector("[data-windows-command]:not([hidden])");
      });
    };
    search.addEventListener("input", update);
    document.addEventListener("site:language-change", update);
    update();
  }
})();
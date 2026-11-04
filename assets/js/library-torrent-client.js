(() => {
  "use strict";

  const files = {
    best: "trackers_best.txt",
    all: "trackers_all.txt",
    udp: "trackers_all_udp.txt",
    http: "trackers_all_http.txt",
    https: "trackers_all_https.txt"
  };
  const base = "https://raw.githubusercontent.com/ngosang/trackerslist/master/";
  const preview = document.getElementById("tracker-preview");
  const status = document.getElementById("tracker-status");
  const copy = document.getElementById("tracker-copy");
  const raw = document.getElementById("tracker-raw-link");
  const buttons = Array.from(document.querySelectorAll("[data-trackers-list]"));
  let trackerText = "";

  if (!preview || !status || !copy || !raw || buttons.length === 0) return;

  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.state = error ? "error" : "success";
  }

  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const file = files[button.dataset.trackersList];
      if (!file) return;

      for (const item of buttons) {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
        item.disabled = true;
      }

      setStatus("Загружаю список с GitHub…");
      try {
        const response = await fetch(base + file, { cache: "no-cache" });
        if (!response.ok) throw new Error("GitHub вернул HTTP " + response.status);

        const result = (await response.text()).trim();
        if (!result) throw new Error("Получен пустой список.");

        trackerText = result;
        preview.textContent = result;
        raw.href = base + file;
        copy.disabled = false;

        const total = result.split(/\r?\n/).filter(Boolean).length;
        setStatus("Загружено трекеров: " + total + ". Источник: " + file);
      } catch (error) {
        trackerText = "";
        preview.textContent = "";
        copy.disabled = true;
        setStatus("Не удалось загрузить список: " + error.message + ". Открой raw-ссылку напрямую.", true);
      } finally {
        for (const item of buttons) item.disabled = false;
      }
    });
  }

  copy.addEventListener("click", async () => {
    if (!trackerText) return;

    try {
      await navigator.clipboard.writeText(trackerText);
      setStatus("Список скопирован в буфер обмена.");
    } catch {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      setStatus("Текст выделен — нажми Ctrl+C.", true);
    }
  });
})();
(() => {
  "use strict";

  const grid = document.getElementById("shares-grid");
  const sortSelect = document.getElementById("share-sort");
  const refreshLabel = document.getElementById("share-refresh-label");
  if (!grid || !sortSelect || !refreshLabel) return;

  const cards = Array.from(grid.querySelectorAll("[data-game-id]"));
  const numberFormat = new Intl.NumberFormat("ru-RU");

  function numericValue(card, key) {
    const value = card.dataset[key];
    if (value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function sortCards() {
    const mode = sortSelect.value;
    const sorted = [...cards].sort((a, b) => {
      if (mode === "name") {
        const aName = a.querySelector(".utility-card-top strong")?.textContent || "";
        const bName = b.querySelector(".utility-card-top strong")?.textContent || "";
        return aName.localeCompare(bName, "ru");
      }

      const primary = mode === "seeders" ? "seeders" : "leechers";
      const secondary = mode === "seeders" ? "leechers" : "seeders";
      const aPrimary = numericValue(a, primary);
      const bPrimary = numericValue(b, primary);

      if (aPrimary === null && bPrimary !== null) return 1;
      if (bPrimary === null && aPrimary !== null) return -1;
      if (aPrimary !== null && bPrimary !== null && aPrimary !== bPrimary) {
        return bPrimary - aPrimary;
      }

      const aSecondary = numericValue(a, secondary);
      const bSecondary = numericValue(b, secondary);
      if (aSecondary === null && bSecondary !== null) return 1;
      if (bSecondary === null && aSecondary !== null) return -1;
      if (aSecondary !== null && bSecondary !== null && aSecondary !== bSecondary) {
        return bSecondary - aSecondary;
      }

      const aName = a.querySelector(".utility-card-top strong")?.textContent || "";
      const bName = b.querySelector(".utility-card-top strong")?.textContent || "";
      return aName.localeCompare(bName, "ru");
    });

    for (const card of sorted) grid.appendChild(card);
  }

  function formatUpdated(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    }).format(date) + " UTC";
  }

  function renderGame(card, item) {
    const seeders = Number.isInteger(item?.seeders) && item.seeders >= 0 ? item.seeders : null;
    const leechers = Number.isInteger(item?.leechers) && item.leechers >= 0 ? item.leechers : null;
    card.dataset.seeders = seeders === null ? "" : String(seeders);
    card.dataset.leechers = leechers === null ? "" : String(leechers);

    const seedersNode = card.querySelector('[data-stat="seeders"]');
    const leechersNode = card.querySelector('[data-stat="leechers"]');
    const stateNode = card.querySelector('[data-stat="state"]');

    if (seedersNode) seedersNode.textContent = seeders === null ? "—" : numberFormat.format(seeders);
    if (leechersNode) leechersNode.textContent = leechers === null ? "—" : numberFormat.format(leechers);

    if (stateNode) {
      if (item?.status === "ok") stateNode.textContent = "Актуально";
      else if (item?.status === "stale") stateNode.textContent = "Последние доступные данные";
      else stateNode.textContent = "Нет данных";
    }
  }

  async function loadStats() {
    try {
      const response = await fetch("/data/torrent-stats.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      const games = data && typeof data.games === "object" ? data.games : {};

      for (const card of cards) {
        renderGame(card, games[card.dataset.gameId]);
      }

      const updated = formatUpdated(data.generated_at);
      refreshLabel.textContent = updated
        ? "Проверено: " + updated
        : "Первая проверка ещё не выполнена";

      if (!updated) {
        refreshLabel.dataset.state = "pending";
      } else {
        refreshLabel.dataset.state = "ready";
      }
    } catch (error) {
      refreshLabel.textContent = "Не удалось загрузить статистику (" + error.message + ")";
      refreshLabel.dataset.state = "error";
    }

    sortCards();
  }

  sortSelect.addEventListener("change", sortCards);
  sortCards();
  loadStats();
})();
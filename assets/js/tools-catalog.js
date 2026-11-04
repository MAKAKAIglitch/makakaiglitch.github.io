(() => {
  "use strict";

  const input = document.getElementById("utility-search");
  const grid = document.getElementById("utilities-grid");
  const cards = Array.from(grid.querySelectorAll(".utility-card"));
  const empty = document.getElementById("utilities-empty");
  const count = document.getElementById("utilities-count");
  const tabs = Array.from(document.querySelectorAll(".utility-tab"));
  let activeFilter = "all";

  function filterUtilities() {
    const query = input.value.trim().toLocaleLowerCase("ru");
    let visible = 0;

    for (const card of cards) {
      const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
      const haystack = (card.dataset.search + " " + card.textContent).toLocaleLowerCase("ru");
      const matches = categoryMatches && haystack.includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    }

    empty.hidden = visible !== 0;
    grid.hidden = visible === 0;
    count.textContent = query || activeFilter !== "all"
      ? visible + " / " + cards.length + " TOOLS"
      : String(cards.length).padStart(2, "0") + " TOOLS";
  }

  for (const tab of tabs) {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter || "all";
      for (const item of tabs) {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      }
      filterUtilities();
    });
  }

  input.addEventListener("input", filterUtilities);
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if (event.key === "/" && !typing) {
      event.preventDefault();
      input.focus();
    }
    if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      filterUtilities();
      input.blur();
    }
  });

  filterUtilities();
})();

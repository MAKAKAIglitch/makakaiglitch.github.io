(() => {
  "use strict";
  const root = document.getElementById("library-nav-dropdown");
  const libraryToggle = document.getElementById("library-nav-toggle");
  const libraryMenu = document.getElementById("library-nav-menu");
  const torrentToggle = document.getElementById("torrent-nav-toggle");
  const torrentMenu = document.getElementById("torrent-nav-menu");
  if (!root || !libraryToggle || !libraryMenu || !torrentToggle || !torrentMenu) return;

  function setTorrentOpen(open) {
    torrentMenu.hidden = !open;
    torrentToggle.setAttribute("aria-expanded", String(open));
  }
  function setLibraryOpen(open) {
    libraryMenu.hidden = !open;
    libraryToggle.setAttribute("aria-expanded", String(open));
    if (!open) setTorrentOpen(false);
  }

  libraryToggle.addEventListener("click", () => setLibraryOpen(libraryMenu.hidden));
  torrentToggle.addEventListener("click", () => setTorrentOpen(torrentMenu.hidden));
  libraryMenu.addEventListener("click", event => {
    if (event.target.closest("a")) setLibraryOpen(false);
  });
  document.addEventListener("click", event => {
    if (!root.contains(event.target)) setLibraryOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!torrentMenu.hidden) {
      setTorrentOpen(false);
      torrentToggle.focus();
      return;
    }
    if (!libraryMenu.hidden) {
      setLibraryOpen(false);
      libraryToggle.focus();
    }
  });
})();
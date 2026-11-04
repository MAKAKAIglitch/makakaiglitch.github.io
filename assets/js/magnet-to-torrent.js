(() => {
  "use strict";

  const WEBTORRENT_MODULE = "https://esm.sh/webtorrent@3.0.21/dist/webtorrent.min.js";
  const METADATA_TIMEOUT_MS = 180000;

  const input = document.getElementById("magnet-input");
  const convertButton = document.getElementById("magnet-convert");
  const clearButton = document.getElementById("magnet-clear");
  const cancelButton = document.getElementById("magnet-cancel");
  const status = document.getElementById("magnet-status");
  const resultPanel = document.getElementById("magnet-result");
  const resultName = document.getElementById("magnet-result-name");
  const resultHash = document.getElementById("magnet-result-hash");
  const resultFiles = document.getElementById("magnet-result-files");
  const downloadButton = document.getElementById("magnet-download");

  if (!input || !convertButton || !clearButton || !cancelButton || !status || !resultPanel || !downloadButton) return;

  let client = null;
  let torrent = null;
  let timeoutId = 0;
  let outputBlob = null;
  let outputName = "torrent.torrent";
  let busy = false;
  let attempt = 0;

  function setStatus(message, state = "info") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function setBusy(value) {
    busy = value;
    convertButton.disabled = value;
    input.disabled = value;
    clearButton.disabled = value;
    cancelButton.disabled = !value;
  }

  function formatBytes(value) {
    if (!Number.isFinite(value) || value < 0) return "размер неизвестен";
    if (value < 1024) return value + " Б";
    const units = ["КиБ", "МиБ", "ГиБ", "ТиБ"];
    let size = value;
    let unit = -1;
    do {
      size /= 1024;
      unit++;
    } while (size >= 1024 && unit < units.length - 1);
    return size.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) + " " + units[unit];
  }

  function safeFileName(value) {
    const cleaned = String(value || "torrent")
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
      .replace(/[. ]+$/g, "")
      .trim()
      .slice(0, 120);
    return (cleaned || "torrent") + ".torrent";
  }

  function destroyClient() {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = 0;
    }
    if (client) {
      try {
        client.destroy();
      } catch {
        // Cleanup is best effort; the UI state is still reset below.
      }
    }
    client = null;
    torrent = null;
  }

  function finishWithError(message) {
    destroyClient();
    setBusy(false);
    setStatus(message, "error");
  }

  function validateMagnet(value) {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error("Ссылка имеет неверный формат.");
    }
    if (parsed.protocol !== "magnet:") {
      throw new Error("Нужна ссылка, начинающаяся с magnet:?");
    }
    const topics = parsed.searchParams.getAll("xt");
    if (!topics.some(topic => /^urn:btih:[a-f0-9]{40}$/i.test(topic) ||
      /^urn:btih:[a-z2-7]{32}$/i.test(topic) ||
      /^urn:btmh:1220[a-f0-9]{64}$/i.test(topic))) {
      throw new Error("В ссылке не найден поддерживаемый infohash (xt=urn:btih или btmh).");
    }
    return parsed;
  }

  async function convert() {
    if (busy) return;

    const value = input.value.trim();
    if (!value) {
      setStatus("Сначала вставь magnet-ссылку.", "error");
      input.focus();
      return;
    }

    let parsed;
    try {
      parsed = validateMagnet(value);
    } catch (error) {
      setStatus(error.message, "error");
      return;
    }

    attempt++;
    const currentAttempt = attempt;
    outputBlob = null;
    resultPanel.hidden = true;
    downloadButton.disabled = true;
    setBusy(true);
    setStatus("Загружаю WebTorrent и проверяю поддержку WebRTC…");

    try {
      const module = await import(WEBTORRENT_MODULE);
      if (currentAttempt !== attempt) return;

      const WebTorrent = module.default || module.WebTorrent || module;
      if (!WebTorrent || !WebTorrent.WEBRTC_SUPPORT) {
        finishWithError("Этот браузер или текущая среда не поддерживает WebRTC, необходимый для браузерного BitTorrent.");
        return;
      }

      client = new WebTorrent();
      client.on("error", error => {
        if (currentAttempt !== attempt || !busy) return;
        finishWithError("Ошибка BitTorrent-клиента: " + (error?.message || "неизвестная ошибка"));
      });

      setStatus("Ищу WebRTC-пиров и запрашиваю метаданные. Это может занять несколько минут…");

      timeoutId = window.setTimeout(() => {
        if (currentAttempt !== attempt || !busy) return;
        finishWithError("За 3 минуты метаданные не получены. Вероятно, в этой раздаче нет доступных WebRTC-пиров.");
      }, METADATA_TIMEOUT_MS);

      torrent = client.add(value, { deselect: true });

      torrent.on("warning", warning => {
        if (currentAttempt !== attempt || !busy) return;
        setStatus("Ожидаю метаданные. Предупреждение: " + (warning?.message || String(warning)));
      });

      torrent.on("error", error => {
        if (currentAttempt !== attempt || !busy) return;
        finishWithError("Не удалось получить метаданные: " + (error?.message || "ошибка BitTorrent"));
      });

      torrent.on("metadata", () => {
        if (currentAttempt !== attempt || !busy) return;

        const blob = torrent.torrentFileBlob ||
          (torrent.torrentFile ? new Blob([torrent.torrentFile], { type: "application/x-bittorrent" }) : null);

        if (!blob || blob.size === 0) {
          finishWithError("Метаданные получены, но WebTorrent не смог сформировать .torrent-файл.");
          return;
        }

        outputBlob = blob;
        outputName = safeFileName(torrent.name || parsed.searchParams.get("dn") || "torrent");
        resultName.textContent = torrent.name || parsed.searchParams.get("dn") || "Торрент без названия";
        resultHash.textContent = "Infohash: " + (torrent.infoHash || "неизвестен");
        resultFiles.textContent = (torrent.files?.length ?? 0) + " файлов · " + formatBytes(torrent.length);
        resultPanel.hidden = false;
        downloadButton.disabled = false;

        destroyClient();
        setBusy(false);
        setStatus("Метаданные получены. .torrent-файл готов к сохранению.", "success");
      });
    } catch (error) {
      if (currentAttempt !== attempt) return;
      finishWithError("Не удалось загрузить WebTorrent: " + (error?.message || "ошибка загрузки библиотеки"));
    }
  }

  convertButton.addEventListener("click", convert);

  clearButton.addEventListener("click", () => {
    attempt++;
    destroyClient();
    setBusy(false);
    input.value = "";
    outputBlob = null;
    resultPanel.hidden = true;
    downloadButton.disabled = true;
    setStatus("Ожидаю magnet-ссылку.");
    input.focus();
  });

  cancelButton.addEventListener("click", () => {
    attempt++;
    destroyClient();
    setBusy(false);
    setStatus("Получение метаданных остановлено.");
  });

  downloadButton.addEventListener("click", () => {
    if (!outputBlob) return;
    const objectUrl = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = outputName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    setStatus("Загрузка .torrent отправлена браузеру.", "success");
  });

  window.addEventListener("pagehide", () => {
    attempt++;
    destroyClient();
  });
})();

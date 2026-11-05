(() => {
  "use strict";

  const form = document.getElementById("download-time-form");
  if (!form) return;

  const $ = (id) => document.getElementById(id);
  const sizeInput = $("download-size");
  const sizeUnit = $("download-size-unit");
  const speedInput = $("download-speed");
  const speedUnit = $("download-speed-unit");
  const result = $("download-time-result");
  const summary = $("download-result-summary");
  const speedBytes = $("download-speed-bytes");
  const sizeBytes = $("download-size-bytes");
  const status = $("download-status");

  const SIZE_FACTORS = Object.freeze({
    B: 1,
    kB: 1e3,
    MB: 1e6,
    GB: 1e9,
    TB: 1e12,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
    TiB: 1024 ** 4
  });

  // All speed factors are converted to bits per second.
  const SPEED_FACTORS = Object.freeze({
    bps: 1,
    Kbps: 1e3,
    Mbps: 1e6,
    Gbps: 1e9,
    "B/s": 8,
    "kB/s": 8e3,
    "MB/s": 8e6,
    "GB/s": 8e9,
    "KiB/s": 8 * 1024,
    "MiB/s": 8 * 1024 ** 2,
    "GiB/s": 8 * 1024 ** 3
  });

  function t(value) {
    return window.siteI18n?.t(value) || value;
  }

  function locale() {
    return window.siteI18n?.language === "en" ? "en-US" : "ru-RU";
  }

  function number(value, digits = 2) {
    return new Intl.NumberFormat(locale(), {
      maximumFractionDigits: digits
    }).format(value);
  }

  function duration(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "—";
    if (seconds === 0) return locale() === "en" ? "0 seconds" : "0 секунд";
    if (seconds < 1) return locale() === "en" ? "Less than a second" : "Меньше секунды";

    let remaining = Math.round(seconds);
    if (remaining === 0) remaining = 1;

    const days = Math.floor(remaining / 86400);
    remaining %= 86400;
    const hours = Math.floor(remaining / 3600);
    remaining %= 3600;
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const isEnglish = locale() === "en";
    const parts = [];

    if (days) parts.push(days + (isEnglish ? (days === 1 ? " day" : " days") : " дн."));
    if (hours) parts.push(hours + (isEnglish ? (hours === 1 ? " hour" : " hours") : " ч"));
    if (minutes) parts.push(minutes + (isEnglish ? (minutes === 1 ? " minute" : " minutes") : " мин"));
    if (secs && parts.length < 2) parts.push(secs + (isEnglish ? (secs === 1 ? " second" : " seconds") : " сек"));

    return parts.length ? parts.join(" ") : (isEnglish ? "Less than a second" : "Меньше секунды");
  }

  function formatBinaryBytes(bytes) {
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }
    return number(value, index === 0 ? 0 : 2) + " " + units[index];
  }

  function setStatus(message, isError = false) {
    status.textContent = t(message);
    status.dataset.state = isError ? "error" : "success";
  }

  function calculate() {
    const size = sizeInput.valueAsNumber;
    const speed = speedInput.valueAsNumber;
    const sizeFactor = SIZE_FACTORS[sizeUnit.value];
    const speedFactor = SPEED_FACTORS[speedUnit.value];

    if (!Number.isFinite(size) || size < 0) {
      setStatus("Укажи корректный размер файла.", true);
      return;
    }
    if (!Number.isFinite(speed) || speed <= 0) {
      setStatus("Скорость должна быть больше нуля.", true);
      return;
    }
    if (!sizeFactor || !speedFactor) {
      setStatus("Неизвестная единица измерения.", true);
      return;
    }

    const bytes = size * sizeFactor;
    const bitsPerSecond = speed * speedFactor;
    const seconds = (bytes * 8) / bitsPerSecond;

    if (!Number.isFinite(bytes) || !Number.isFinite(bitsPerSecond) || !Number.isFinite(seconds)) {
      setStatus("Слишком большое значение для расчёта.", true);
      return;
    }

    result.textContent = duration(seconds);
    summary.textContent = number(size, 4) + " " + sizeUnit.value + " · " +
      number(speed, 4) + " " + speedUnit.value;
    speedBytes.textContent = number(bitsPerSecond / 8e6, 3) + " MB/s";
    sizeBytes.textContent = formatBinaryBytes(bytes);
    setStatus("Расчёт обновлён. Скорость считается постоянной.");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(calculate, 0);
  });

  for (const control of [sizeInput, sizeUnit, speedInput, speedUnit]) {
    control.addEventListener("input", calculate);
    control.addEventListener("change", calculate);
  }

  document.querySelectorAll(".download-preset").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.size !== undefined) {
        sizeInput.value = button.dataset.size;
        sizeUnit.value = button.dataset.unit;
      }
      if (button.dataset.speed !== undefined) {
        speedInput.value = button.dataset.speed;
        speedUnit.value = button.dataset.speedUnit;
      }
      calculate();
    });
  });

  document.addEventListener("site:language-change", calculate);
  calculate();
})();
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);

  function setStatus(id, message, isError = false) {
    const node = byId(id);
    node.textContent = message;
    node.dataset.state = isError ? "error" : "success";
  }

  async function copyText(value, statusId) {
    if (!value) {
      setStatus(statusId, "Сначала создай результат.", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setStatus(statusId, "Скопировано в буфер обмена.");
    } catch {
      setStatus(statusId, "Браузер не разрешил доступ к буферу обмена.", true);
    }
  }

  function randomInt(max) {
    if (!Number.isSafeInteger(max) || max < 1 || max > 256) {
      throw new RangeError("Недопустимый диапазон случайного числа.");
    }
    const limit = 256 - (256 % max);
    const byte = new Uint8Array(1);
    let value;
    do {
      crypto.getRandomValues(byte);
      value = byte[0];
    } while (value >= limit);
    return value % max;
  }

  function generateUuid() {
    if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" +
      hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  byId("uuid-generate").addEventListener("click", () => {
    try {
      byId("uuid-output").value = generateUuid();
      setStatus("uuid-status", "Новый UUID создан.");
    } catch {
      setStatus("uuid-status", "Криптографический генератор недоступен в этом браузере.", true);
    }
  });
  byId("uuid-copy").addEventListener("click", () =>
    copyText(byId("uuid-output").value, "uuid-status")
  );

  const lengthInput = byId("password-length");
  const lengthValue = byId("password-length-value");
  lengthInput.addEventListener("input", () => { lengthValue.value = lengthInput.value; });

  function generatePassword() {
    const groups = [];
    if (byId("password-lower").checked) groups.push("abcdefghijkmnopqrstuvwxyz");
    if (byId("password-upper").checked) groups.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
    if (byId("password-numbers").checked) groups.push("23456789");
    if (byId("password-symbols").checked) groups.push("!@#$%^&*()-_=+[]{}:,.?");
    if (!groups.length) throw new Error("Выбери хотя бы один набор символов.");

    const all = groups.join("");
    const length = Number(lengthInput.value);
    if (length < groups.length) throw new Error("Длина меньше количества выбранных наборов.");

    const result = [];
    for (const group of groups) result.push(group[randomInt(group.length)]);
    while (result.length < length) result.push(all[randomInt(all.length)]);

    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result.join("");
  }

  byId("password-generate").addEventListener("click", () => {
    try {
      byId("password-output").value = generatePassword();
      setStatus("password-status", "Пароль создан локально в браузере.");
    } catch (error) {
      setStatus("password-status", error.message, true);
    }
  });
  byId("password-copy").addEventListener("click", () =>
    copyText(byId("password-output").value, "password-status")
  );

  function transformJson(minify) {
    const input = byId("json-input").value;
    try {
      if (!input.trim()) throw new Error("Введи JSON для обработки.");
      const parsed = JSON.parse(input);
      byId("json-input").value = minify
        ? JSON.stringify(parsed)
        : JSON.stringify(parsed, null, 2);
      setStatus("json-status", minify ? "JSON сжат." : "JSON отформатирован.");
    } catch (error) {
      setStatus("json-status", error instanceof SyntaxError ? "Некорректный JSON: " + error.message : error.message, true);
    }
  }

  byId("json-format").addEventListener("click", () => transformJson(false));
  byId("json-minify").addEventListener("click", () => transformJson(true));
  byId("json-copy").addEventListener("click", () =>
    copyText(byId("json-input").value, "json-status")
  );

  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const normalized = value.replace(/\s+/g, "");
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  byId("base64-encode").addEventListener("click", () => {
    try {
      const input = byId("base64-input").value;
      byId("base64-output").value = bytesToBase64(new TextEncoder().encode(input));
      setStatus("base64-status", "Текст закодирован в Base64.");
    } catch (error) {
      setStatus("base64-status", error.message || "Не удалось закодировать данные.", true);
    }
  });

  byId("base64-decode").addEventListener("click", () => {
    try {
      const bytes = base64ToBytes(byId("base64-input").value);
      byId("base64-output").value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      setStatus("base64-status", "Base64 декодирован в UTF-8.");
    } catch (error) {
      setStatus("base64-status", "Некорректный Base64 или данные не являются UTF-8.", true);
    }
  });

  byId("base64-copy").addEventListener("click", () =>
    copyText(byId("base64-output").value, "base64-status")
  );

  byId("uuid-generate").click();
  byId("password-generate").click();
})();

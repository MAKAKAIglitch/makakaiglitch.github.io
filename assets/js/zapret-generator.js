(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const t = value => window.siteI18n?.t(value) || value;
  const engine = $("zapret-engine");
  const profile = $("zapret-profile");
  const warpWireGuard = $("zapret-warp-wireguard");
  const warpMasque = $("zapret-warp-masque");
  const quic = $("zapret-quic");
  const customTcpEnabled = $("zapret-use-custom-tcp");
  const customTcpInput = $("zapret-custom-tcp");
  const output = $("zapret-output");
  const status = $("zapret-output-status");
  const outputType = $("zapret-output-type");
  const saveNote = $("zapret-save-note");
  const portSummary = $("zapret-port-summary");

  const WARP_WG_UDP = ["2408", "500", "1701", "4500"];
  const WARP_MASQUE_UDP = ["500", "1701", "4500", "4443", "8443", "8095"];
  const BASE_TCP = ["80", "443", "2053", "2083", "2087", "2096", "8443"];
  const DISCORD_UDP = ["19294-19344", "50000-50100"];
  const FLOWSEAL_REF = "2401b7a13837139b0265632464ba563dddbf80d8";
  const FLOWSEAL_REPO = "Flowseal/zapret-discord-youtube";
  const FLOWSEAL_CONFIGS = [
    { file: "general.bat", group: "General", label: "General — базовая стратегия" },
    { file: "general (ALT).bat", group: "ALT", label: "ALT" },
    { file: "general (ALT2).bat", group: "ALT", label: "ALT2" },
    { file: "general (ALT3).bat", group: "ALT", label: "ALT3" },
    { file: "general (ALT4).bat", group: "ALT", label: "ALT4" },
    { file: "general (ALT5).bat", group: "ALT", label: "ALT5 — NOT RECOMMENDED", warning: "В исходном файле Flowseal есть комментарий NOT RECOMMENDED." },
    { file: "general (ALT6).bat", group: "ALT", label: "ALT6" },
    { file: "general (ALT7).bat", group: "ALT", label: "ALT7" },
    { file: "general (ALT8).bat", group: "ALT", label: "ALT8" },
    { file: "general (ALT9).bat", group: "ALT", label: "ALT9" },
    { file: "general (ALT10).bat", group: "ALT", label: "ALT10" },
    { file: "general (ALT11).bat", group: "ALT", label: "ALT11" },
    { file: "general (ALT12).bat", group: "ALT", label: "ALT12" },
    { file: "general (ALT13).bat", group: "ALT", label: "ALT13" },
    { file: "general (EXP).bat", group: "Experimental", label: "EXP — экспериментальная", warning: "Имя исходного файла помечает эту стратегию как EXP." },
    { file: "general (FAKE TLS AUTO).bat", group: "FAKE TLS AUTO", label: "FAKE TLS AUTO" },
    { file: "general (FAKE TLS AUTO ALT).bat", group: "FAKE TLS AUTO", label: "FAKE TLS AUTO ALT" },
    { file: "general (FAKE TLS AUTO ALT2).bat", group: "FAKE TLS AUTO", label: "FAKE TLS AUTO ALT2" },
    { file: "general (FAKE TLS AUTO ALT3).bat", group: "FAKE TLS AUTO", label: "FAKE TLS AUTO ALT3" },
    { file: "general (SIMPLE FAKE).bat", group: "SIMPLE FAKE", label: "SIMPLE FAKE" },
    { file: "general (SIMPLE FAKE ALT).bat", group: "SIMPLE FAKE", label: "SIMPLE FAKE ALT" },
    { file: "general (SIMPLE FAKE ALT2).bat", group: "SIMPLE FAKE", label: "SIMPLE FAKE ALT2" }
  ];
  const flowsealCache = new Map();
  let lastFlowsealProfile = "general.bat";
  let lastZapret2Profile = "balanced";
  let renderRequest = 0;
  let lastBuild = null;

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function parsePorts(value, label) {
    const raw = value.split(",").map(item => item.trim()).filter(Boolean);
    if (!raw.length) return [];
    const result = [];
    for (const part of raw) {
      if (!/^\d+(?:-\d+)?$/.test(part)) {
        throw new Error(label + ": используй номера или диапазоны через запятую.");
      }
      const [firstText, lastText = firstText] = part.split("-");
      const first = Number(firstText), last = Number(lastText);
      if (!Number.isInteger(first) || !Number.isInteger(last) || first < 1 || last > 65535 || first > last) {
        throw new Error(label + ": порт должен быть в диапазоне 1–65535.");
      }
      if (first <= 443 && last >= 443) {
        throw new Error("443 нельзя добавлять в пользовательский WARP/TCP список. Обычный HTTPS 443 управляется отдельно.");
      }
      result.push(first === last ? String(first) : first + "-" + last);
    }
    return unique(result);
  }

  function getPortConfig() {
    const wg = warpWireGuard.checked ? [...WARP_WG_UDP] : [];
    const masque = warpMasque.checked ? [...WARP_MASQUE_UDP] : [];
    const warpUdp = unique([...wg, ...masque]);
    const masqueOnly = warpWireGuard.checked
      ? (warpMasque.checked ? ["4443", "8443", "8095"] : [])
      : masque;
    if (customTcpEnabled.checked && !customTcpInput.value.trim()) {
      throw new Error("Укажи TCP-порты или отключи дополнительный TCP-фильтр.");
    }
    const customTcp = customTcpEnabled.checked
      ? parsePorts(customTcpInput.value, "TCP")
      : [];
    const udpIntercept = unique([
      ...(quic.checked ? ["443"] : []),
      ...DISCORD_UDP,
      ...warpUdp
    ]);
    const tcpIntercept = unique([...BASE_TCP, ...customTcp]);
    return { wg, masque, masqueOnly, warpUdp, customTcp, udpIntercept, tcpIntercept };
  }

  function commonHeader(title, target) {
    return [
      "@echo off",
      "chcp 65001 >nul",
      "title " + title,
      "cd /d \"%~dp0\"",
      "echo.",
      "echo Experimental zapret strategy",
      "echo Generated locally by MAKAKAIglitch Zapret Strategy Generator",
      "echo Target folder: " + target,
      "echo This file does not install or update zapret.",
      "echo."
    ];
  }

  function encodePath(path) {
    return path.split("/").map(part => encodeURIComponent(part)).join("/");
  }

  function flowsealProfileUrl(entry) {
    return "https://github.com/" + FLOWSEAL_REPO + "/blob/" + FLOWSEAL_REF + "/" + encodePath(entry.file);
  }

  async function loadFlowsealProfile(entry) {
    if (flowsealCache.has(entry.file)) return flowsealCache.get(entry.file);
    const path = encodePath(entry.file);
    const rawUrl = "https://raw.githubusercontent.com/" + FLOWSEAL_REPO + "/" + FLOWSEAL_REF + "/" + path;
    let failure = null;

    try {
      const response = await fetch(rawUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error("raw HTTP " + response.status);
      const content = await response.text();
      if (!content.includes("winws.exe") || !content.includes("--wf-tcp=") || !content.includes("--wf-udp=")) {
        throw new Error("Полученный файл не похож на оригинальную стратегию Flowseal.");
      }
      flowsealCache.set(entry.file, content);
      return content;
    } catch (error) {
      failure = error;
    }

    try {
      const apiUrl = "https://api.github.com/repos/" + FLOWSEAL_REPO + "/contents/" + path + "?ref=" + FLOWSEAL_REF;
      const response = await fetch(apiUrl, { cache: "no-cache", headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("GitHub API HTTP " + response.status);
      const payload = await response.json();
      if (payload.encoding !== "base64" || !payload.content) throw new Error("GitHub API did not return base64 content.");
      const binary = atob(payload.content.replace(/\s/g, ""));
      const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
      const content = new TextDecoder("utf-8").decode(bytes);
      if (!content.includes("winws.exe") || !content.includes("--wf-tcp=") || !content.includes("--wf-udp=")) {
        throw new Error("Полученный файл не похож на оригинальную стратегию Flowseal.");
      }
      flowsealCache.set(entry.file, content);
      return content;
    } catch (apiError) {
      throw new Error("Не удалось загрузить " + entry.file + " из Flowseal. Проверь доступ к GitHub. " +
        (failure ? String(failure.message) + "; " : "") + String(apiError.message));
    }
  }

  function ensureNewContinuation(line) {
    let value = line.trimEnd().replace(/\s*\^$/, "");
    if (!/(^|\s)--new(?:\s|$)/.test(value)) value += " --new";
    return value + " ^";
  }

  function flowsealDependencies(template) {
    return unique([...template.matchAll(/%BIN%([^"\s]+\.bin)/gi)].map(match => match[1]));
  }

  function injectFlowsealPorts(template, ports, entry) {
    const lines = template.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const startIndex = lines.findIndex(line =>
      line.includes("winws.exe") && line.includes("--wf-tcp=") && line.includes("--wf-udp=")
    );
    if (startIndex < 0) throw new Error("В оригинальном .bat не найдена строка запуска winws.exe.");

    const wfMatch = lines[startIndex].match(/--wf-tcp=([^\s]+)\s+--wf-udp=([^\s]+)/);
    if (!wfMatch) throw new Error("Не удалось разобрать --wf-tcp/--wf-udp в оригинальном профиле.");

    const wfTcp = unique([...wfMatch[1].split(","), ...ports.customTcp]);
    const wfUdp = unique([...wfMatch[2].split(","), ...ports.warpUdp]);
    lines[startIndex] = lines[startIndex].replace(
      wfMatch[0],
      "--wf-tcp=" + wfTcp.join(",") + " --wf-udp=" + wfUdp.join(",")
    );

    const gameTcpIndex = lines.findIndex(line => line.includes("--filter-tcp=%GameFilterTCP%"));
    const gameUdpIndex = lines.findIndex(line => line.includes("--filter-udp=%GameFilterUDP%"));
    if (ports.customTcp.length && gameTcpIndex < 0) {
      throw new Error("В выбранном профиле не найдена исходная GameFilter TCP-стратегия для расширения портов.");
    }
    if (ports.wg.length && gameUdpIndex < 0) {
      throw new Error("В выбранном профиле не найдена исходная GameFilter UDP-стратегия для WARP.");
    }

    const before = new Map();
    const after = new Map();
    const addBefore = (index, line) => before.set(index, [...(before.get(index) || []), line]);
    const addAfter = (index, line) => after.set(index, [...(after.get(index) || []), line]);

    if (ports.customTcp.length) {
      const rule = lines[gameTcpIndex].replace(
        "--filter-tcp=%GameFilterTCP%",
        "--filter-tcp=" + ports.customTcp.join(",")
      );
      addAfter(gameTcpIndex, ensureNewContinuation(rule));
    }

    if (ports.wg.length) {
      const rule = lines[gameUdpIndex].replace(
        "--filter-udp=%GameFilterUDP%",
        "--filter-udp=" + ports.wg.join(",")
      );
      addBefore(gameUdpIndex, ensureNewContinuation(rule));
    }

    if (ports.masque.length) {
      const quicIndex = lines.findIndex(line =>
        line.includes("--dpi-desync-fake-quic=") &&
        (line.includes("--filter-udp=443") || line.includes("--filter-l7=quic"))
      );
      if (quicIndex < 0) {
        throw new Error("В оригинальном профиле не найдена QUIC-стратегия для MASQUE-портов.");
      }
      let rule = lines[quicIndex];
      if (rule.includes("--filter-udp=443")) {
        rule = rule.replace("--filter-udp=443", "--filter-udp=" + ports.masque.join(","));
      } else {
        rule = rule.replace("--filter-l7=quic", "--filter-udp=" + ports.masque.join(",") + " --filter-l7=quic");
      }
      addAfter(quicIndex, ensureNewContinuation(rule));
    }

    const result = [];
    lines.forEach((line, index) => {
      if (before.has(index)) result.push(...before.get(index));
      result.push(line);
      if (after.has(index)) result.push(...after.get(index));
    });

    const comments = [
      "::",
      ":: Customized with MAKAKAIglitch Zapret Strategy Generator",
      ":: Original Flowseal profile: " + entry.file,
      ":: Upstream: https://github.com/" + FLOWSEAL_REPO + "/tree/" + FLOWSEAL_REF,
      ":: Extra WARP UDP ports: " + (ports.warpUdp.length ? ports.warpUdp.join(",") : "none"),
      ":: No UDP/TCP 443 was added to the WARP port list.",
      ":: Flowseal's original HTTPS/QUIC rules are preserved from the selected source file."
    ];
    result.splice(Math.min(2, result.length), 0, ...comments);
    const dependencies = flowsealDependencies(template);
    return {
      content: result.join("\r\n").replace(/(?:\r\n)*$/, "\r\n"),
      dependencies
    };
  }

  async function flowsealV1(ports, entry, template) {
    const result = injectFlowsealPorts(template, ports, entry);
    return result;
  }

  function zapret2(ports, chosenProfile) {
    const onlyWireGuard = chosenProfile === "wireguard";
    const lines = commonHeader("Zapret2 experimental strategy", "zapret-win-bundle\\zapret-winws folder");
    lines.push(
      'if not exist "%~dp0winws2.exe" (',
      '  echo ERROR: winws2.exe was not found. Save this CMD into zapret-win-bundle\\zapret-winws.',
      "  pause",
      "  exit /b 1",
      ")",
      'if not exist "%~dp0lua\\zapret-lib.lua" (',
      '  echo ERROR: lua\\zapret-lib.lua was not found. Use the Windows zapret bundle folder.',
      "  pause",
      "  exit /b 1",
      ")"
    );

    const wfTcp = onlyWireGuard ? [...ports.customTcp] : unique(["80", "443", ...ports.customTcp]);
    const wfUdp = unique([...(quic.checked && !onlyWireGuard ? ["443"] : []), ...ports.warpUdp]);
    const args = [];
    if (wfTcp.length) args.push("--wf-tcp-out=" + wfTcp.join(","));
    if (wfUdp.length) args.push("--wf-udp-out=" + wfUdp.join(","));
    args.push(
      '--lua-init=@"%~dp0lua\\zapret-lib.lua"',
      '--lua-init=@"%~dp0lua\\zapret-antidpi.lua"'
    );

    if (!onlyWireGuard) {
      args.push(
        "--filter-tcp=80 --filter-l7=http --out-range=-d10 --payload=http_req --lua-desync=fake:blob=fake_default_http:ip_autottl=-2,3-20:ip6_autottl=-2,3-20:tcp_md5 --lua-desync=fakedsplit:ip_autottl=-2,3-20:ip6_autottl=-2,3-20:tcp_md5 --new",
        "--filter-tcp=443 --filter-l7=tls --out-range=-d10 --payload=tls_client_hello --lua-desync=fake:blob=fake_default_tls:tcp_md5:tcp_seq=-10000:repeats=6 --lua-desync=multidisorder:pos=midsld --new"
      );
      if (quic.checked) {
        args.push(
          "--filter-udp=443 --filter-l7=quic --payload=quic_initial --lua-desync=fake:blob=fake_default_quic:repeats=6 --new"
        );
      }
    }

    if (ports.customTcp.length) {
      args.push(
        "--filter-tcp=" + ports.customTcp.join(",") + " --filter-l7=tls --payload=tls_client_hello --lua-desync=fake:blob=fake_default_tls:repeats=6 --lua-desync=multidisorder:pos=midsld --new"
      );
    }

    if (ports.wg.length) {
      args.push(
        "--filter-udp=" + ports.wg.join(",") + " --filter-l7=wireguard --payload=wireguard_initiation --lua-desync=repeater:instances=2:repeats=3 --lua-desync=luaexec:code=\"desync.rnd=brandom(math.random(32,64))\" --lua-desync=fake:blob=rnd --new"
      );
    }
    if (ports.masqueOnly.length) {
      args.push(
        "--filter-udp=" + ports.masque.join(",") + " --filter-l7=quic --payload=quic_initial --lua-desync=fake:blob=fake_default_quic:repeats=6 --new"
      );
    }

    lines.push('start "zapret2: experimental generated" /min "%~dp0winws2.exe" ^');
    lines.push(...args.map((arg, index) => arg + (index < args.length - 1 ? " ^" : "")));
    lines.push(
      "echo.",
      "echo winws2 was started. Check its console/log output for errors.",
      "pause"
    );
    return lines.join("\r\n") + "\r\n";
  }

  function setProfileInfo(message, state) {
    const info = $("zapret-profile-info");
    info.textContent = message;
    info.dataset.state = state || "info";
  }

  function rebuildFlowsealProfileOptions() {
    const query = (profileSearch.value || "").trim().toLocaleLowerCase();
    const current = profile.value || lastFlowsealProfile;
    const matches = FLOWSEAL_CONFIGS.filter(entry =>
      (entry.file + " " + entry.label + " " + entry.group).toLocaleLowerCase().includes(query)
    );
    const groups = [];
    matches.forEach(entry => {
      let group = groups.find(item => item.name === entry.group);
      if (!group) {
        group = { name: entry.group, entries: [] };
        groups.push(group);
      }
      group.entries.push(entry);
    });

    profile.innerHTML = "";
    if (!matches.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = t("Нет совпадений");
      profile.appendChild(option);
      profile.disabled = true;
    } else {
      profile.disabled = false;
      groups.forEach(group => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = group.name;
        group.entries.forEach(entry => {
          const option = document.createElement("option");
          option.value = entry.file;
          option.textContent = entry.label + (entry.warning ? " ⚠" : "");
          optgroup.appendChild(option);
        });
        profile.appendChild(optgroup);
      });
      profile.value = matches.some(entry => entry.file === current)
        ? current
        : (matches.some(entry => entry.file === lastFlowsealProfile) ? lastFlowsealProfile : matches[0].file);
      lastFlowsealProfile = profile.value;
    }
    $("zapret-profile-count").textContent = query
      ? t("Найдено: ") + matches.length + " / " + FLOWSEAL_CONFIGS.length
      : t("Оригинальные конфигурации: ") + FLOWSEAL_CONFIGS.length;
    return matches;
  }

  function updateProfileOptions() {
    const isV1 = engine.value === "v1";
    const quicOption = quic.closest(".zapret-option");
    if (isV1) {
      $("zapret-profile-label").textContent = t("Оригинальная стратегия Flowseal");
      $("zapret-profile-search-wrap").hidden = false;
      profileSearch.disabled = false;
      quicOption.hidden = true;
      quic.disabled = true;
      $("zapret-version-note").textContent = t("Zapret 1 загружает оригинальный .bat из Flowseal. Нужны winws.exe, service.bat, папки bin и lists из совместимой сборки.");
      $("zapret-source-link").href = "https://github.com/" + FLOWSEAL_REPO + "/tree/" + FLOWSEAL_REF;
      $("zapret-source-link").textContent = t("Оригинальные конфигурации Flowseal ↗");
      $("zapret-profile-dependencies").textContent = t("Зависимости bin будут показаны после загрузки профиля.");
      rebuildFlowsealProfileOptions();
      const entry = FLOWSEAL_CONFIGS.find(item => item.file === profile.value);
      if (entry) {
        $("zapret-source-link").href = flowsealProfileUrl(entry);
        setProfileInfo(entry.warning || t("22 оригинальных .bat-профиля. Выбранный файл загружается из Flowseal и сохраняет собственные параметры."));
      }
    } else {
      if (FLOWSEAL_CONFIGS.some(item => item.file === profile.value)) lastFlowsealProfile = profile.value;
      $("zapret-profile-label").textContent = t("Базовая стратегия");
      $("zapret-profile-search-wrap").hidden = true;
      profileSearch.disabled = true;
      profile.innerHTML =
        '<option value="balanced">' + t("Стандартная HTTP / TLS / QUIC + WARP") + '</option>' +
        '<option value="wireguard">' + t("Только WireGuard / WARP") + '</option>';
      profile.disabled = false;
      profile.value = lastZapret2Profile;
      quicOption.hidden = false;
      quic.disabled = false;
      $("zapret-version-note").textContent = t("Нужны winws2.exe и Lua-файлы из Windows bundle. WARP WireGuard распознаётся отдельно через --filter-l7=wireguard и --payload=wireguard_initiation; это не конфиг Flowseal winws.exe.");
      $("zapret-source-link").href = "https://github.com/bol-van/zapret-win-bundle/blob/master/zapret-winws/preset2_example.cmd";
      $("zapret-source-link").textContent = t("Оригинальный пример zapret 2 ↗");
      $("zapret-profile-dependencies").textContent = t("Для V2 используются winws2.exe и Lua-файлы Windows bundle.");
      setProfileInfo(t("Режим V2 использует отдельный синтаксис winws2 и Lua, профили Flowseal для winws.exe сюда не переносятся."));
    }
    render();
  }

  async function render() {
    const request = ++renderRequest;
    const engineValue = engine.value;
    const chosenProfile = profile.value;
    try {
      const ports = getPortConfig();
      let content;
      let filename;

      if (engineValue === "v1") {
        const entry = FLOWSEAL_CONFIGS.find(item => item.file === chosenProfile);
        if (!entry) throw new Error("Выбери оригинальную стратегию Flowseal.");
        status.textContent = t("Загружаю оригинальную стратегию Flowseal…");
        status.dataset.state = "loading";
        setProfileInfo(entry.warning || t("Загружаю оригинальный файл ") + entry.file + "…");
        $("zapret-source-link").href = flowsealProfileUrl(entry);
        const template = await loadFlowsealProfile(entry);
        if (request !== renderRequest) return false;
        const result = await flowsealV1(ports, entry, template);
        content = result.content;
        const slug = entry.file.replace(/\.bat$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
        filename = "zapret-flowseal-" + slug + "-custom.bat";
        const depText = result.dependencies.length
          ? t("Файлы, которые профиль ожидает в bin: ") + result.dependencies.join(", ")
          : t("В исходном профиле не обнаружены зависимости .bin.");
        $("zapret-profile-dependencies").textContent = depText;
        setProfileInfo(entry.warning
          ? entry.warning + " " + t("Оригинальные параметры сохранены; WARP-порты добавлены отдельно.")
          : t("Загружен оригинальный ") + entry.file + t(". Его параметры и порядок правил сохранены; добавлены только выбранные фильтры портов."));
        $("zapret-profile-info").dataset.state = entry.warning ? "warning" : "info";
        outputType.textContent = t("BAT · Оригинальный Flowseal / winws.exe");
        saveNote.textContent = t("Сохрани BAT в корневую папку Flowseal, рядом с service.bat. Проверь, что все перечисленные bin-файлы есть в твоей установленной сборке. Оригинальный general.bat не заменяется.");
      } else {
        content = zapret2(ports, chosenProfile);
        filename = "zapret2-experimental.cmd";
        outputType.textContent = t("CMD · zapret2 / winws2.exe");
        saveNote.textContent = t("Сохрани CMD в папку zapret-win-bundle\\zapret-winws, рядом с winws2.exe и папкой lua. Нужен именно Windows bundle с winws2.");
      }

      if (request !== renderRequest) return false;
      output.value = content;
      lastBuild = { content, filename };
      status.textContent = t("Конфигурация собрана");
      status.dataset.state = "ready";

      const summary = [];
      summary.push(t("WARP UDP: ") + (ports.warpUdp.length ? ports.warpUdp.join(", ") : t("не добавлен")));
      if (engineValue === "v1") {
        summary.push(t("Оригинальные QUIC-правила Flowseal оставлены без изменений; UDP 443 не добавлялся как WARP-порт."));
        summary.push(t("V1 WireGuard-фильтр использует общий UDP-шаблон выбранного профиля."));
      } else {
        summary.push("QUIC UDP 443: " + (quic.checked && chosenProfile !== "wireguard" ? t("включён как обычный веб-трафик") : t("выключен")));
      }
      summary.push(t("Дополнительный TCP: ") + (ports.customTcp.length ? ports.customTcp.join(", ") : t("нет")));
      portSummary.textContent = summary.join(" · ");
      return true;
    } catch (error) {
      if (request !== renderRequest) return false;
      output.value = "";
      lastBuild = null;
      status.textContent = t(error.message);
      status.dataset.state = "error";
      if (engineValue === "v1") {
        setProfileInfo(t("Не удалось получить или обработать оригинальный профиль. ") + error.message, "error");
        $("zapret-profile-dependencies").textContent = t("Проверь доступ к raw.githubusercontent.com или api.github.com.");
      }
      portSummary.textContent = t("Исправь параметры портов, чтобы собрать конфигурацию.");
      return false;
    }
  }

  async function copyOutput() {
    if (!lastBuild) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(lastBuild.content);
      } else {
        output.focus();
        output.select();
        const ok = document.execCommand("copy");
        output.setSelectionRange(0, 0);
        if (!ok) throw new Error("copy failed");
      }
      status.textContent = t("Скопировано в буфер обмена");
      status.dataset.state = "ready";
    } catch (_) {
      status.textContent = t("Не удалось скопировать. Выдели текст вручную.");
      status.dataset.state = "error";
    }
  }

  function downloadOutput() {
    if (!lastBuild) return;
    const blob = new Blob([lastBuild.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = lastBuild.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    status.textContent = t("Файл подготовлен для скачивания");
    status.dataset.state = "ready";
  }

  engine.addEventListener("change", () => {
    if (engine.value === "v1" && FLOWSEAL_CONFIGS.some(item => item.file === profile.value)) {
      lastFlowsealProfile = profile.value;
    }
    if (engine.value === "v2" && ["balanced", "wireguard"].includes(profile.value)) {
      lastZapret2Profile = profile.value;
    }
    updateProfileOptions();
  });
  profile.addEventListener("change", () => {
    if (engine.value === "v1") {
      lastFlowsealProfile = profile.value;
      const entry = FLOWSEAL_CONFIGS.find(item => item.file === profile.value);
      if (entry) $("zapret-source-link").href = flowsealProfileUrl(entry);
    } else {
      lastZapret2Profile = profile.value;
    }
    render();
  });
  profileSearch.addEventListener("input", () => {
    const previous = profile.value;
    rebuildFlowsealProfileOptions();
    if (profile.value !== previous) {
      lastFlowsealProfile = profile.value;
      render();
    }
  });
  [warpWireGuard, warpMasque, quic, customTcpEnabled, customTcpInput].forEach(control => {
    control.addEventListener("change", render);
    control.addEventListener("input", render);
  });
  $("zapret-add-wireguard").addEventListener("click", () => {
    warpWireGuard.checked = true;
    render();
  });
  $("zapret-add-masque").addEventListener("click", () => {
    warpMasque.checked = true;
    render();
  });
  $("zapret-fill-tcp").addEventListener("click", () => {
    customTcpInput.value = WARP_WG_UDP.join(",");
    customTcpEnabled.checked = true;
    render();
    customTcpInput.focus();
  });
  $("zapret-copy").addEventListener("click", copyOutput);
  $("zapret-download").addEventListener("click", downloadOutput);
  $("zapret-reset").addEventListener("click", () => {
    engine.value = "v1";
    warpWireGuard.checked = true;
    warpMasque.checked = false;
    quic.checked = false;
    customTcpEnabled.checked = false;
    customTcpInput.value = "";
    profile.value = "general.bat";
    profileSearch.value = "";
    updateProfileOptions();
    status.textContent = t("Настройки сброшены");
    status.dataset.state = "ready";
  });

  updateProfileOptions();
})();

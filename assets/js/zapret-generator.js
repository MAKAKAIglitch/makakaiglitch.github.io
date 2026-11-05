(() => {
  "use strict";
  const $ = id => document.getElementById(id);
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

  function flowsealV1(ports, chosenProfile) {
    const bin = "%BIN%";
    const lists = "%LISTS%";
    const lines = commonHeader("Zapret Flowseal experimental strategy", "Flowseal zapret root folder");
    lines.push(
      'if not exist "%~dp0bin\\winws.exe" (',
      '  echo ERROR: winws.exe was not found. Save this BAT into the Flowseal zapret root folder.',
      "  pause",
      "  exit /b 1",
      ")",
      'if not exist "%~dp0service.bat" (',
      "  echo ERROR: service.bat was not found. This template is for the Flowseal build.",
      "  pause",
      "  exit /b 1",
      ")",
      'set "BIN=%~dp0bin\\"',
      'set "LISTS=%~dp0lists\\"',
      'call "%~dp0service.bat" load_game_filter',
      'call "%~dp0service.bat" load_user_lists',
      "echo Starting generated strategy...",
      "echo."
    );

    const wfTcp = unique([...ports.tcpIntercept, "%GameFilterTCP%"]);
    const wfUdp = unique([...ports.udpIntercept, "%GameFilterUDP%"]);
    const args = [
      "--wf-tcp=" + wfTcp.join(","),
      "--wf-udp=" + wfUdp.join(",")
    ];

    if (ports.masqueOnly.length) {
      // The separate MASQUE fallback block is appended below.
    }

    if (ports.wg.length) {
      // This group follows the Flowseal GameFilter unknown-UDP pattern.
    }

    if (ports.customTcp.length) {
      // Custom TCP/TLS ports are handled with a separate any-protocol rule.
    }

    const split = chosenProfile === "alt2"
      ? { seq: "652", pos: "2" }
      : { seq: "568", pos: "1" };

    args.push(
      '--filter-udp=19294-19344,50000-50100 --filter-l7=discord,stun --dpi-desync=fake --dpi-desync-fake-discord="' + bin + 'ACTIVE_DISCORD_UDP.bin" --dpi-desync-fake-stun="' + bin + 'ACTIVE_DISCORD_UDP.bin" --dpi-desync-repeats=6 --new',
      '--filter-tcp=2053,2083,2087,2096,8443 --hostlist-domains=discord.media --dpi-desync=multisplit --dpi-desync-split-seqovl=681 --dpi-desync-split-pos=1 --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_www_google_com.bin" --new',
      '--filter-tcp=443 --hostlist="' + lists + 'list-google.txt" --ip-id=zero --dpi-desync=multisplit --dpi-desync-split-seqovl=' + split.seq + ' --dpi-desync-split-pos=' + split.pos + ' --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_www_google_com.bin" --new'
    );

    if (chosenProfile === "simple") {
      args.push(
        '--filter-tcp=80,443 --hostlist="' + lists + 'list-general.txt" --hostlist="' + lists + 'list-general-user.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-fooling=badseq --dpi-desync-badseq-increment=2 --dpi-desync-fake-tls="' + bin + 'tls_clienthello_www_google_com.bin" --new',
        '--filter-tcp=80,443,8443 --ipset="' + lists + 'ipset-all.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-fooling=badseq --dpi-desync-badseq-increment=2 --dpi-desync-fake-tls="' + bin + 'tls_clienthello_www_google_com.bin" --new'
      );
    } else {
      args.push(
        '--filter-tcp=80,443 --hostlist="' + lists + 'list-general.txt" --hostlist="' + lists + 'list-general-user.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=multisplit --dpi-desync-split-seqovl=' + split.seq + ' --dpi-desync-split-pos=' + split.pos + ' --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_4pda_to.bin" --new',
        '--filter-tcp=80,443,8443 --ipset="' + lists + 'ipset-all.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=multisplit --dpi-desync-split-seqovl=' + split.seq + ' --dpi-desync-split-pos=' + split.pos + ' --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_4pda_to.bin" --new'
      );
    }

    args.push(
      '--filter-tcp=%GameFilterTCP% --ipset="' + lists + 'ipset-all.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=multisplit --dpi-desync-any-protocol=1 --dpi-desync-cutoff=n3 --dpi-desync-split-seqovl=' + split.seq + ' --dpi-desync-split-pos=' + split.pos + ' --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_4pda_to.bin" --new',
      '--filter-udp=%GameFilterUDP% --ipset="' + lists + 'ipset-all.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=fake --dpi-desync-repeats=12 --dpi-desync-any-protocol=1 --dpi-desync-fake-unknown-udp="' + bin + 'ACTIVE_GAME_UDP.bin" --dpi-desync-cutoff=n2'
    );

    if (quic.checked) {
      args.push(
        '--filter-udp=443 --hostlist="' + lists + 'list-general.txt" --hostlist="' + lists + 'list-general-user.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-fake-quic="' + bin + 'quic_initial_www_google_com.bin" --new',
        '--filter-udp=443 --ipset="' + lists + 'ipset-all.txt" --hostlist-exclude="' + lists + 'list-exclude.txt" --hostlist-exclude="' + lists + 'list-exclude-user.txt" --ipset-exclude="' + lists + 'ipset-exclude.txt" --ipset-exclude="' + lists + 'ipset-exclude-user.txt" --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-fake-quic="' + bin + 'quic_initial_www_google_com.bin" --new'
      );
    }

    if (ports.wg.length) {
      args.push(
        '--filter-udp=' + ports.wg.join(",") + ' --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-any-protocol=1 --dpi-desync-fake-unknown-udp="' + bin + 'ACTIVE_GAME_UDP.bin" --dpi-desync-cutoff=n2 --new'
      );
    }
    if (ports.masqueOnly.length) {
      args.push(
        '--filter-udp=' + ports.masqueOnly.join(",") + ' --filter-l7=quic --dpi-desync=fake --dpi-desync-repeats=6 --dpi-desync-fake-quic="' + bin + 'quic_initial_www_google_com.bin" --new'
      );
    }
    if (ports.customTcp.length) {
      args.push(
        '--filter-tcp=' + ports.customTcp.join(",") + ' --dpi-desync=multisplit --dpi-desync-any-protocol=1 --dpi-desync-cutoff=n3 --dpi-desync-split-seqovl=' + split.seq + ' --dpi-desync-split-pos=' + split.pos + ' --dpi-desync-split-seqovl-pattern="' + bin + 'tls_clienthello_4pda_to.bin"'
      );
    }

    lines.push('start "zapret: experimental generated" /min "%BIN%winws.exe" ^');
    lines.push(...args.map((arg, index) => arg + (index < args.length - 1 ? " ^" : "")));
    lines.push(
      "echo.",
      "echo Strategy process was started. Check the Flowseal service and tray status.",
      "pause"
    );
    return lines.join("\r\n") + "\r\n";
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

    const wfTcp = unique(["80", "443", ...ports.customTcp]);
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
      if (ports.customTcp.length) {
        args.push(
          "--filter-tcp=" + ports.customTcp.join(",") + " --filter-l7=tls --payload=tls_client_hello --lua-desync=fake:blob=fake_default_tls:repeats=6 --lua-desync=multidisorder:pos=midsld --new"
        );
      }
    }

    if (ports.wg.length) {
      args.push(
        "--filter-udp=" + ports.wg.join(",") + " --filter-l7=wireguard --payload=wireguard_initiation --lua-desync=repeater:instances=2:repeats=3 --lua-desync=luaexec:code=\"desync.rnd=brandom(math.random(32,64))\" --lua-desync=fake:blob=rnd --new"
      );
    }
    if (ports.masqueOnly.length) {
      args.push(
        "--filter-udp=" + ports.masqueOnly.join(",") + " --filter-l7=quic --payload=quic_initial --lua-desync=fake:blob=fake_default_quic:repeats=6 --new"
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

  function render() {
    const engineValue = engine.value;
    const chosenProfile = profile.value;
    try {
      const ports = getPortConfig();
      const content = engineValue === "v1"
        ? flowsealV1(ports, chosenProfile)
        : zapret2(ports, chosenProfile);
      output.value = content;
      lastBuild = {
        content,
        filename: engineValue === "v1" ? "zapret-flowseal-experimental.bat" : "zapret2-experimental.cmd"
      };
      outputType.textContent = engineValue === "v1" ? "BAT · Flowseal / winws.exe" : "CMD · zapret2 / winws2.exe";
      status.textContent = "Конфигурация собрана";
      status.dataset.state = "ready";
      saveNote.textContent = engineValue === "v1"
        ? "Сохрани BAT в корневую папку Flowseal, рядом с service.bat. Не заменяй general.bat — используй отдельный файл."
        : "Сохрани CMD в папку zapret-win-bundle\\zapret-winws, рядом с winws2.exe и папкой lua. Нужен именно Windows bundle с winws2.";
      const summary = [];
      summary.push("WARP UDP: " + (ports.warpUdp.length ? ports.warpUdp.join(", ") : "не добавлен"));
      summary.push("QUIC UDP 443: " + (quic.checked && chosenProfile !== "wireguard" ? "включён как обычный веб-трафик" : "выключен"));
      summary.push("Дополнительный TCP: " + (ports.customTcp.length ? ports.customTcp.join(", ") : "нет"));
      portSummary.textContent = summary.join(" · ");
      return true;
    } catch (error) {
      output.value = "";
      lastBuild = null;
      status.textContent = error.message;
      status.dataset.state = "error";
      portSummary.textContent = "Исправь параметры портов, чтобы собрать конфигурацию.";
      return false;
    }
  }

  function updateProfileOptions() {
    const value = profile.value;
    if (engine.value === "v1") {
      profile.innerHTML =
        '<option value="general">Flowseal General — multisplit</option>' +
        '<option value="alt2">Flowseal ALT2 — другой split offset</option>' +
        '<option value="simple">Flowseal SIMPLE FAKE ALT</option>';
      profile.value = ["general", "alt2", "simple"].includes(value) ? value : "general";
      $("zapret-version-note").textContent = "Профили Flowseal рассчитаны на его Windows-сборку: winws.exe, папки bin и lists, service.bat. В шаблонах используются имена файлов из bin.";
    } else {
      profile.innerHTML =
        '<option value="balanced">Стандартная HTTP / TLS / QUIC + WARP</option>' +
        '<option value="wireguard">Только WireGuard / WARP</option>';
      profile.value = value === "wireguard" ? "wireguard" : "balanced";
      $("zapret-version-note").textContent = "Для zapret 2 нужен winws2.exe и Lua-файлы из Windows bundle bol-van/zapret-win-bundle. Это не конфиг для Flowseal winws.exe.";
    }
    render();
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
      status.textContent = "Скопировано в буфер обмена";
      status.dataset.state = "ready";
    } catch (_) {
      status.textContent = "Не удалось скопировать. Выдели текст вручную.";
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
    status.textContent = "Файл подготовлен для скачивания";
    status.dataset.state = "ready";
  }

  engine.addEventListener("change", updateProfileOptions);
  profile.addEventListener("change", render);
  [warpWireGuard, warpMasque, quic, customTcpEnabled, customTcpInput].forEach(control => {
    control.addEventListener("change", render);
    control.addEventListener("input", render);
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
    quic.checked = true;
    customTcpEnabled.checked = false;
    customTcpInput.value = "";
    profile.value = "general";
    updateProfileOptions();
    status.textContent = "Настройки сброшены";
    status.dataset.state = "ready";
  });

  updateProfileOptions();
})();

(() => {
"use strict";
const KEY="makakaiglitch.language.v1", RU="ru", EN="en";
const map={
"Проекты, эксперименты и разработки в одном месте.":"Projects, experiments and development in one place.",
"Сортировка":"Sort","Недавно обновлялись":"Recently updated","Больше звёзд":"Most stars","По названию":"By name",
"Загружаю репозитории…":"Loading repositories…","ПУБЛИЧНЫЕ РЕПОЗИТОРИИ":"PUBLIC REPOSITORIES",
"Получаем список с GitHub":"Fetching repositories from GitHub","Ничего не найдено":"Nothing found",
"Попробуй изменить поисковый запрос.":"Try changing your search query.","Не удалось загрузить репозитории":"Could not load repositories",
"Проверь подключение и попробуй ещё раз.":"Check your connection and try again.","Повторить":"Retry",
"Данные загружаются с GitHub":"Loading data from GitHub","Описание пока не добавлено.":"No description added yet.",
"Обновлён":"Updated","Открыть статистику репозитория":"Open repository details","Подробнее":"Details",
"Проекты, эксперименты и разработки в одном месте":"Projects, experiments and development in one place",
"Небольшой набор инструментов, которые действительно нужны.":"A small set of tools that are actually useful.",
"Набор инструментов для VPN, BitTorrent и диагностики сети":"Tools for VPN, BitTorrent and network diagnostics",
"Сборка конфигураций WireGuard и AmneziaWG 2.0 из параметров Cloudflare WARP.":"Build WireGuard and AmneziaWG 2.0 configs from Cloudflare WARP parameters.",
"Экспериментальное получение .torrent из magnet-ссылки через BitTorrent metadata exchange.":"Experimental .torrent creation from magnet links through BitTorrent metadata exchange.",
"Экспериментальная генерация BAT/CMD стратегий для zapret 1 (Flowseal) и zapret 2 с дополнительными портами WARP.":"Experimental BAT/CMD strategy generation for zapret 1 (Flowseal) and zapret 2 with additional WARP ports.",
"Zapret Strategy Generator":"Zapret Strategy Generator",
"Экспериментальный генератор стратегий zapret":"Experimental zapret strategy generator",
"Собери собственный профиль для Windows: zapret 1 на базе стратегий Flowseal или zapret 2 на базе winws2.":"Build a Windows profile: zapret 1 based on Flowseal strategies or zapret 2 based on winws2.",
"Это конструктор конфигураций, а не проверка работоспособности.":"This is a configuration builder, not a functionality test.",
"Генератор собирает BAT/CMD-файл. Он не скачивает winws, не запускает команды и не проверяет, подходит ли стратегия твоему провайдеру. Сначала проверь сгенерированный профиль вручную.":"The generator creates a BAT/CMD file. It does not download winws, run commands, or test whether a strategy works with your ISP. Test the generated profile manually first.",
"1. Движок и стратегия":"1. Engine and strategy",
"Версии несовместимы между собой — выбери ту, которая уже установлена.":"The versions are not compatible with each other — choose the one you already have installed.",
"Версия zapret":"zapret version",
"Базовая стратегия":"Base strategy",
"Профили Flowseal рассчитаны на структуру его Windows-сборки: winws.exe, папки bin и lists, service.bat.":"Flowseal profiles expect its Windows bundle structure: winws.exe, bin and lists folders, and service.bat.",
"2. WARP и дополнительные порты":"2. WARP and additional ports",
"Выбирай конкретные порты, которые нужно добавить в перехват.":"Choose the exact ports to add to interception.",
"WARP WireGuard — UDP":"WARP WireGuard — UDP",
"2408 — основной; 500, 1701, 4500 — запасные порты Cloudflare.":"2408 is the default; 500, 1701 and 4500 are Cloudflare fallback ports.",
"MASQUE fallback — UDP без 443":"MASQUE fallback — UDP without 443",
"Добавит 500, 1701, 4500, 4443, 8443 и 8095. Основной MASQUE UDP 443 намеренно не добавляется.":"Adds 500, 1701, 4500, 4443, 8443 and 8095. The primary MASQUE UDP 443 port is intentionally omitted.",
"Обычный QUIC — UDP 443":"Regular QUIC — UDP 443",
"Стандартный HTTPS/3 для сайтов. Это отдельный веб-трафик, не WARP-порт; по умолчанию выключен.":"Standard HTTPS/3 for websites. This is regular web traffic, not a WARP port; disabled by default.",
"Стандартный HTTPS/3 для сайтов. Это отдельный веб-трафик, не WARP-порт.":"Standard HTTPS/3 for websites. This is regular web traffic, not a WARP port.",
"Дополнительные TCP-порты — вручную":"Additional TCP ports — manual",
"Добавить эти TCP-порты в фильтр":"Add these TCP ports to the filter",
"У WireGuard WARP нет стандартного TCP-порта 2408/500: туннель использует UDP. Здесь можно задать собственные TCP/TLS-порты для отдельного сервиса.":"WireGuard WARP has no standard TCP ports 2408/500: the tunnel uses UDP. Enter custom TCP/TLS ports for a separate service here.",
"Например: 2053, 2083, 8443":"For example: 2053, 2083, 8443",
"Подставить номера WARP":"Fill in WARP port numbers",
"Повторить номера в TCP":"Repeat the numbers in TCP",
"Режим обработки будет экспериментальным; эти порты не становятся от этого штатными TCP-портами WARP.":"Handling is experimental; these do not become standard WARP TCP ports.",
"3. Результат":"3. Output",
"Предпросмотр обновляется при изменении настроек. Файл сохраняется локально через браузер.":"The preview updates when settings change. The file is saved locally by your browser.",
"Для zapret 1 сохрани .bat в корневую папку Flowseal, рядом с service.bat. Не заменяй general.bat — используй отдельный файл.":"For zapret 1, save the .bat into the Flowseal root folder next to service.bat. Do not replace general.bat — use a separate file.",
"Для zapret 2 нужен winws2.exe и Lua-файлы из Windows bundle bol-van/zapret-win-bundle. Это не конфиг для Flowseal winws.exe.":"Zapret 2 requires winws2.exe and Lua files from the bol-van/zapret-win-bundle Windows bundle. This is not a config for Flowseal winws.exe.",
"Профили Flowseal требуют winws.exe, bin, lists и service.bat. Для WARP здесь используется общий unknown-UDP приём из GameFilter — он экспериментальный и не распознаёт WireGuard отдельно.":"Flowseal profiles require winws.exe, bin, lists and service.bat. WARP uses the generic unknown-UDP GameFilter method here — it is experimental and does not identify WireGuard separately.",
"Нужны winws2.exe и Lua-файлы из Windows bundle. WARP WireGuard распознаётся отдельно через --filter-l7=wireguard и --payload=wireguard_initiation; это не конфиг Flowseal winws.exe.":"Requires winws2.exe and Lua files from the Windows bundle. WARP WireGuard is identified separately via --filter-l7=wireguard and --payload=wireguard_initiation; this is not a Flowseal winws.exe config.",

"Что важно знать о WARP":"WARP port notes",
"Порты разделены по протоколам и не смешиваются в один список.":"Ports are separated by protocol and are not mixed into one list.",
"Для TCP":"For TCP",
"Документация и источники":"Documentation and sources",
"BAT · Flowseal / winws.exe":"BAT · Flowseal / winws.exe",
"CMD · zapret2 / winws2.exe":"CMD · zapret2 / winws2.exe",
"Конфигурация собрана":"Configuration generated",
"Готово к генерации":"Ready to generate",
"Скопировано в буфер обмена":"Copied to clipboard",
"Не удалось скопировать. Выдели текст вручную.":"Could not copy. Select the text manually.",
"Файл подготовлен для скачивания":"File prepared for download",
"Настройки сброшены":"Settings reset",
"Исправь параметры портов, чтобы собрать конфигурацию.":"Correct the port settings to generate a configuration.",
"WARP UDP: ":"WARP UDP: ",
"не добавлен":"not added",
"включён как обычный веб-трафик":"enabled as regular web traffic",
"выключен":"disabled",
"нет":"none",
"используй номера или диапазоны через запятую.":"use port numbers or ranges separated by commas.",
"порт должен быть в диапазоне 1–65535.":"port must be between 1 and 65535.",
"443 нельзя добавлять в пользовательский WARP/TCP список. Обычный HTTPS 443 управляется отдельно.":"443 cannot be added to the custom WARP/TCP list. Regular HTTPS 443 is controlled separately.",
"Flowseal General — multisplit":"Flowseal General — multisplit",
"Flowseal ALT2 — другой split offset":"Flowseal ALT2 — alternate split offset",
"Flowseal SIMPLE FAKE ALT":"Flowseal SIMPLE FAKE ALT",
"Стандартная HTTP / TLS / QUIC + WARP":"Standard HTTP / TLS / QUIC + WARP",
"Только WireGuard / WARP":"WireGuard / WARP only",
"Все утилиты":"All utilities",
"Укажи TCP-порты или отключи дополнительный TCP-фильтр.":"Enter TCP ports or disable the additional TCP filter.",
"+ Добавить WARP WireGuard":"+ Add WARP WireGuard",
"+ Добавить MASQUE без 443":"+ Add MASQUE without 443",


"Определение и копирование публичных IPv4 и IPv6 адресов.":"Detect and copy public IPv4 and IPv6 addresses.",
"Запрос A, AAAA, MX, TXT, NS и других DNS-записей через DoH.":"Query A, AAAA, MX, TXT, NS and other DNS records over DoH.",
"Все утилиты":"All utilities","Важно:":"Important:",
"этот инструмент собирает файл из уже существующих ключей и параметров WARP. Он работает локально и не регистрирует новое устройство в Cloudflare. Для регистрации нового WARP-аккаунта есть отдельный внешний сервис.":"This tool builds a file from existing WARP keys and parameters. It runs locally and does not register a new Cloudflare device. Use a separate external service to register a new WARP account.",
"Новый WARP-аккаунт ↗":"New WARP account ↗","01 / Исходные данные":"01 / Input",
"Вставь существующий WireGuard-конфиг — поля заполнятся автоматически. Либо введи значения вручную.":"Paste an existing WireGuard config to fill the fields automatically, or enter values manually.",
"Импорт существующего .conf":"Import existing .conf","Разобрать конфиг":"Parse config",
"Очистить":"Clear","Формат результата":"Output format","Обычный WireGuard":"Standard WireGuard",
"PresharedKey (необязательно)":"PresharedKey (optional)","AmneziaWG 2.0 — шумовые пакеты":"AmneziaWG 2.0 — packet obfuscation",
"Собрать конфигурацию":"Build configuration","Данные остаются в этой вкладке браузера.":"Your data stays in this browser tab.",
"Приватность:":"Privacy:","страница не отправляет введённые ключи на сервер и не сохраняет их в localStorage. Не публикуй готовый .conf: внутри приватный ключ.":"This page does not send your keys to a server or save them in localStorage. Do not publish the generated .conf: it contains your private key.",
"02 / Результат":"02 / Output","Проверь настройки и скачай файл для импорта в AmneziaWG или WireGuard.":"Review the settings and download the file for AmneziaWG or WireGuard.",
"Конфигурация .conf":"Configuration .conf","Копировать":"Copy","Скачать .conf":"Download .conf",
"Получение метаданных из magnet-ссылки и сохранение их в обычный .torrent-файл.":"Retrieve metadata from a magnet link and save it as a standard .torrent file.",
"Тестовый режим":"Experimental mode",
"Браузерный WebTorrent подключается только к WebRTC-совместимым пирам. Обычные TCP/UDP-пиры qBittorrent этот браузерный клиент напрямую не видит. Поэтому часть magnet-ссылок не сможет получить метаданные — это ограничение браузерного P2P, а не ошибка ссылки.":"Browser WebTorrent connects only to WebRTC-compatible peers. It cannot directly reach regular TCP/UDP qBittorrent peers, so some magnet links cannot retrieve metadata. This is a browser P2P limitation, not necessarily a bad link.",
"Magnet-ссылка":"Magnet link","Вставь полную magnet-ссылку с infohash.":"Paste the full magnet link, including its infohash.",
"Получить метаданные":"Get metadata","Остановить":"Stop","Ожидаю magnet-ссылку.":"Waiting for a magnet link.",
"Метаданные получены":"Metadata received","Скачать .torrent ↓":"Download .torrent ↓",
"Для получения .torrent нужны метаданные info dictionary. Один infohash и имя из magnet-ссылки не содержат списка файлов, размеров и piece hashes — собрать полноценный торрент только из этих строк нельзя.":"Creating a .torrent requires the info dictionary. An infohash and display name do not contain the file list, sizes or piece hashes, so a complete torrent cannot be reconstructed from those strings alone.",
"Ссылка и infohash используются браузером для подключения к WebRTC-пирам и трекерам. Сам файл и введённые данные на сервер сайта не отправляются.":"The browser uses the link and infohash to connect to WebRTC peers and trackers. The file and entered data are not uploaded to this website.",
"Коллекция полезных материалов и инструментов.":"A collection of useful resources and tools.",
"Windows":"Windows",
"Полезные команды, диагностика, сетевые инструменты и справочные материалы для Windows 10 и 11.":"Useful commands, diagnostics, network tools and reference material for Windows 10 and 11.",
"Команды и быстрый доступ":"Commands and quick access",
"Окна Win + R, команды CMD и PowerShell для повседневной работы.":"Win + R tools, CMD and PowerShell commands for everyday use.",
"Сеть и интернет":"Network and internet",
"IP-адреса, DNS, маршруты, проверка соединения и сетевых адаптеров.":"IP addresses, DNS, routes, connection tests and network adapters.",
"Диагностика системы":"System diagnostics",
"Сведения о ПК, дисках, драйверах, журналах событий и проверка системных файлов.":"PC, disk and driver information, event logs and system file checks.",
"С чего начать":"Getting started",
"Три команды, которые помогают быстро понять состояние системы.":"Three commands that quickly show the state of your system.",
"Как пользоваться командами":"How to use commands",
"Короткая памятка перед запуском.":"A short guide before running commands.",
"Кнопка «Копировать» помещает команду в буфер обмена. Она сама ничего не запускает.":"The Copy button puts the command on your clipboard. It does not run anything.",
"Команды Windows":"Windows commands",
"Быстрый доступ к системным окнам, CMD и PowerShell. Ищи команду и копируй её в терминал.":"Quick access to Windows tools, CMD and PowerShell. Find a command and copy it to the terminal.",
"Поиск команды":"Search commands",
"Например: процесс, версия, диск...":"For example: process, version, disk...",
"Все команды":"All commands",
"Быстрые окна — Win + R":"Quick tools — Win + R",
"Нажми Win + R, вставь команду и нажми Enter.":"Press Win + R, enter the command and press Enter.",
"Командная строка — CMD":"Command Prompt — CMD",
"Открой cmd.exe или Windows Terminal с профилем Command Prompt.":"Open cmd.exe or Windows Terminal with the Command Prompt profile.",
"Сведения о системе":"System information",
"Версия Windows":"Windows version",
"Диагностика DirectX":"DirectX diagnostics",
"Диспетчер задач":"Task Manager",
"Монитор ресурсов":"Resource Monitor",
"Монитор стабильности":"Reliability Monitor",
"Просмотр событий":"Event Viewer",
"Диспетчер устройств":"Device Manager",
"Управление дисками":"Disk Management",
"Сетевые подключения":"Network Connections",
"Службы Windows":"Windows services",
"Установленные программы":"Installed programs",
"PowerShell":"PowerShell",
"Открой PowerShell или Windows Terminal с профилем PowerShell.":"Open PowerShell or Windows Terminal with the PowerShell profile.",
"Топ процессов по CPU":"Top processes by CPU",
"Тома и свободное место":"Volumes and free space",
"Физические диски":"Physical disks",
"Устройства с ошибками":"Devices with errors",
"Видеоконтроллеры":"Display adapters",
"Без прав администратора":"No administrator rights",
"Администратор":"Administrator",
"Копировать":"Copy",
"Скопировано":"Copied",
"Не удалось скопировать команду.":"Could not copy the command.",
"Команды не найдены":"No matching commands",
"Показано команд: ":"Commands shown: ",
"Сеть и интернет — Windows":"Network and internet — Windows",
"Команды для проверки IP, DNS, маршрутов, сетевого адаптера и доступности узлов.":"Commands to check IP, DNS, routes, network adapters and host availability.",
"Базовая диагностика — CMD":"Basic diagnostics — CMD",
"Команды можно выполнять в обычной командной строкке.":"Commands can be run in a regular Command Prompt.",
"IP-конфигурация":"IP configuration",
"Кэш DNS":"DNS cache",
"Проверка IP-доступности":"IP connectivity test",
"Проверка DNS и доступа":"DNS and connectivity test",
"Маршрут до узла":"Route to host",
"DNS-запрос":"DNS lookup",
"Таблица маршрутизации":"Routing table",
"Таблица ARP":"ARP table",
"Сведения о Wi-Fi":"Wi-Fi information",
"Очистить локальный DNS-кэш":"Clear local DNS cache",
"PowerShell — сеть":"PowerShell — networking",
"Команды показывают конфигурацию и проверяют TCP-подключение.":"Commands show configuration and test TCP connectivity.",
"IP и шлюз интерфейсов":"Interface IP and gateway",
"DNS-серверы интерфейсов":"Interface DNS servers",
"Разрешение DNS-имени":"DNS name resolution",
"Проверка TCP-порта":"TCP port test",
"Как читать результаты":"How to read the results",
"Подсказки по частым полям.":"Hints for common fields.",
"Диагностика Windows":"Windows diagnostics",
"Проверка системных файлов, хранилища компонентов, дисков, драйверов и журналов.":"Check system files, component store, disks, drivers and logs.",
"Проверка и исправление — разные действия":"Checking and repairing are different actions",
"Сначала выполни диагностику и посмотри результат. Команды восстановления запускай отдельно, когда понятна причина.":"Run diagnostics first and review the result. Use repair commands separately when the cause is clear.",
"Сведения и журналы":"Information and logs",
"Эти команды в основном собирают информацию.":"These commands mainly collect information.",
"Подробности об ОС и ПК":"OS and PC details",
"История стабильности":"Reliability history",
"Системные журналы":"System event logs",
"Состояние физических дисков":"Physical disk status",
"Проверка системных файлов и образа Windows":"Check Windows system files and image",
"Запускай эти команды в терминале от имени администратора.":"Run these commands in a terminal as administrator.",
"Только проверить системные файлы":"Verify system files only",
"Быстрая проверка хранилища компонентов":"Quick component store check",
"Полное сканирование хранилища компонентов":"Full component store scan",
"Проверить и восстановить системные файлы":"Check and repair system files",
"Восстановить хранилище компонентов":"Repair the component store",
"Проверка дисков":"Disk checks",
"Команды ниже не содержат параметров принудительного исправления.":"The commands below do not use forced repair options.",
"Проверка файловой системы":"File system check",
"Онлайн-сканирование NTFS":"Online NTFS scan",
"Сведения о томах":"Volume information",
"Рекомендуемый порядок проверки":"Suggested diagnostic order",
"Когда Windows ведёт себя нестабильно.":"When Windows behaves unexpectedly.",
"Документация Microsoft":"Microsoft documentation",
"Скопируй команду":"Copy command",
"Быстрые команды":"Quick commands",

"Раздачи, трекеры и инструменты BitTorrent-клиента.":"Torrent shares, trackers and BitTorrent client tools.",
"Выбери, что хочешь открыть.":"Choose what you want to open.",
"Раздачи":"Shares","Торрент-файлы и ссылки на раздачи.":"Torrent files and share links.",
"Настройки клиента":"Client settings","Трекеры, DHT, PeX и полезные параметры BitTorrent.":"Trackers, DHT, PeX and useful BitTorrent settings.",
"Торрент-файлы и официальные источники":"Torrent files and official sources",
"По личерам ↓":"Most leechers ↓","По сидерам ↓":"Most seeders ↓",
"Статистика ещё не собрана":"Statistics have not been collected yet",
"Официальный торрент Gaijin Entertainment для War Thunder — можно открыть в qBittorrent или другом BitTorrent-клиенте":"Official Gaijin Entertainment torrent for War Thunder — open it in qBittorrent or another BitTorrent client",
"Официальный торрент Gaijin Entertainment для Enlisted — загрузка идёт в фоне, страница остаётся открытой":"Official Gaijin Entertainment torrent for Enlisted — downloads in the background while this page stays open",
"Сидеры":"Seeders","Личеры":"Leechers","Ожидаем статистику":"Waiting for statistics",
"Сайт War Thunder ↗":"War Thunder website ↗","Сайт Enlisted ↗":"Enlisted website ↗",
"Спрос: высокий":"Demand: High","Спрос: средний":"Demand: Medium",
"Публичные трекеры и справочная информация для BitTorrent-клиента.":"Public trackers and reference information for a BitTorrent client.",
"Публичные BitTorrent-трекеры":"Public BitTorrent trackers",
"Списки announce URL из проекта ngosang/trackerslist. Выбери тип списка, чтобы загрузить его, скопировать или открыть исходный файл.":"Announce URL lists from ngosang/trackerslist. Choose a list type to load, copy or open the raw file.",
"Лучшие":"Best","Все":"All","Копировать список":"Copy list","Открыть raw ↗":"Open raw ↗",
"Выбери тип списка для загрузки с GitHub.":"Choose a list type to load from GitHub.",
"Как работает поиск пиров":"How peer discovery works","Клиент может использовать несколько механизмов одновременно:":"A client can use several discovery methods at once:",
"Состояние трекеров меняется со временем. В списках могут встречаться временно недоступные адреса.":"Tracker availability changes over time. Lists may contain temporarily unavailable addresses.",
"Проверка публичного IP":"Public IP check","Определение внешнего адреса с поддержкой IPv4 и IPv6":"Detect your external address with IPv4 and IPv6 support",
"Определить IP-адрес":"Detect IP address","Копировать IP":"Copy IP","Проверяем IPv4 и IPv6…":"Checking IPv4 and IPv6…",
"Определены IPv4 и IPv6.":"IPv4 and IPv6 detected.","Не удалось определить IP. Проверь соединение и попробуй снова.":"Could not detect your IP. Check your connection and try again.",
"Параметры браузера":"Browser details","Локальная информация, доступная странице":"Local information available to this page",
"Язык браузера":"Browser language","Часовой пояс":"Time zone","Платформа":"Platform","Тип соединения":"Connection type",
"Для определения IP браузер отправляет запрос сервису ipify. Геолокация, имя провайдера и история посещений не запрашиваются.":"To detect your IP, the browser sends a request to ipify. No geolocation, ISP name or browsing history is requested.",
"DNS-запрос":"DNS query","Ответ от публичного Cloudflare DNS resolver":"Response from Cloudflare's public DNS resolver",
"Доменное имя":"Domain name","Тип записи":"Record type","Выполнить DNS-запрос":"Run DNS query",
"Копировать ответы":"Copy answers","Результаты DNS":"DNS results","Введите домен для запроса.":"Enter a domain to query.",
"Ответов не найдено.":"No answers found.","DNS-over-HTTPS через Cloudflare. Запрос отправляется резолверу Cloudflare; сам сайт не хранит историю DNS-запросов.":"DNS-over-HTTPS via Cloudflare. The query is sent to Cloudflare's resolver; this site does not store DNS query history.",
"Глобальный поиск по сайту":"Global site search","Искать по всему сайту...":"Search the entire site...",
"ПОИСК ПО ВСЕМУ САЙТУ":"SEARCH THE ENTIRE SITE","Введи запрос: проект, утилита, торрент, трекер или тему.":"Search for a project, tool, torrent, tracker or topic.",
"Поиск":"Search","Поиск репозиториев...":"Search repositories...","Поиск утилит...":"Search utilities...",
"Список репозиториев":"Repository list","Каталог утилит":"Utilities catalog","Разделы Library":"Library sections",
"Разделы Torrent":"Torrent sections","Торрент-раздачи":"Torrent shares","Настройки BitTorrent-клиента":"BitTorrent client settings",
"Список трекеров":"Tracker list","Тип списка трекеров":"Tracker list type",
"Открыть релизы":"Open releases","Открыть":"Open","Releases":"Releases",
"Загрузка статистики…":"Loading repository statistics…","Статистика репозитория":"Repository statistics",
"Звёзды":"Stars","Форки":"Forks","Наблюдатели":"Watchers","Открытые issues":"Open issues",
"Скачивания релизов":"Release downloads","Количество релизов":"Release count","Языки":"Languages",
"Основной язык":"Primary language","Лицензия":"License","Создан":"Created",
"Обновлён":"Updated","Последний push":"Last push","Ветка по умолчанию":"Default branch",
"Размер репозитория":"Repository size","Темы":"Topics","Последний релиз":"Latest release",
"Нет опубликованных релизов":"No published releases","Нет данных о языках":"No language data",
"Закрыть":"Close","Открыть README":"Open README","Открыть Issues":"Open issues","Открыть Commits":"Open commits",
"Дата неизвестна":"Date unknown","Нет данных":"No data","Недоступно":"Unavailable",
"Данные из кэша":"Cached data","Обновлено":"Updated","Показаны сохранённые данные; обновить не удалось":"Showing saved data; refresh failed",
"Репозитории недоступны":"Repositories unavailable","Повторить":"Retry",
"GitHub временно ограничил количество запросов. Попробуй немного позже.":"GitHub temporarily rate-limited requests. Try again later.",
"ОТКРЫТЫЙ КОД":"OPEN SOURCE","БРАУЗЕРНЫЕ УТИЛИТЫ":"BROWSER UTILITIES","ЛИЧНАЯ БИБЛИОТЕКА":"PERSONAL LIBRARY",
"ДЕТАЛИ РЕПОЗИТОРИЯ":"REPOSITORY DETAILS","СЕТЬ / ДИАГНОСТИКА":"NETWORK / DIAGNOSTICS","СЕТЬ / DNS":"NETWORK / DNS",
"БИТТОРРЕНТ / ЭКСПЕРИМЕНТ":"BITTORRENT / EXPERIMENTAL","ТОРРЕНТ / РАЗДАЧИ":"TORRENT / SHARES","ТОРРЕНТ / КЛИЕНТ":"TORRENT / CLIENT",
"БИБЛИОТЕКА / ТОРРЕНТ":"LIBRARY / TORRENT","Репозитории":"Repositories","Утилиты":"Utilities","Библиотека":"Library","Основная навигация":"Main navigation","Список репозиториев":"Repository list","Каталог утилит":"Utilities catalog","Утилита":"Tool","Репозиторий":"Repository","Материал":"Page",
"IP-адрес скопирован.":"IP address copied.","Буфер обмена недоступен в этом контексте.":"Clipboard access is unavailable in this context.",
"Определён один адрес. Второй протокол может быть недоступен в этой сети.":"One address was detected. The other protocol may be unavailable on this network.",
"Отправляем DNS-запрос через Cloudflare…":"Sending DNS query through Cloudflare…",
"Запрос завершён":"Query finished","DNS-ответы скопированы.":"DNS answers copied.","Не удалось скопировать ответы.":"Could not copy the answers.",
"Введите корректное доменное имя.":"Enter a valid domain name.",
"Сетевая диагностика":"Network diagnostics","Локальный сборщик конфигураций":"Local configuration builder",
"Personal library":"Personal library","Experimental browser tool":"Experimental browser tool",
"Network diagnostics":"Network diagnostics","Local config builder":"Local config builder",
"Статистика раздачи":"Torrent swarm statistics","Скачивание идёт в фоне":"Download runs in the background","Официальный торрент":"Official torrent",
"Экспериментальное получение .torrent из magnet-ссылки.":"Experimental .torrent creation from a magnet link.",
"Импортировано полей: ":"Imported fields: ",". Проверь их перед сборкой.":". Review them before building.",
": нужен корректный Base64-ключ длиной 32 байта.":": must be a valid 32-byte Base64 key.",
": укажи целое число.":": enter an integer.",": диапазон ":": allowed range ",": проверь значение.":": check the value.",
"Endpoint: порт должен быть 1–65535.":"Endpoint: port must be between 1 and 65535.",
"Jmin не может быть больше Jmax.":"Jmin cannot be greater than Jmax.",
"Конфигурация собрана локально. Ключи не отправлялись на сервер.":"Configuration built locally. Keys were not sent to a server.",
"Не удалось собрать конфигурацию.":"Could not build the configuration.",
"Конфигурация скопирована.":"Configuration copied.","Нажми Ctrl+C, текст выделен.":"Press Ctrl+C; the text is selected.",
"Файл подготовлен для скачивания.":"File is ready to download.","Поля очищены.":"Fields cleared.",
"Сначала вставь текст .conf.":"Paste the .conf text first.",
"Не найдены поля [Interface] и [Peer]. Проверь формат.":"[Interface] and [Peer] sections not found. Check the format.",
"Загружаю трекерный список с GitHub…":"Loading tracker list from GitHub…",
"Загружаю список с GitHub…":"Loading the list from GitHub…","Получен пустой список.":"The returned list is empty.",
"Загружено трекеров: ":"Trackers loaded: ",". Источник: ":". Source: ",
"Не удалось загрузить список: ":"Could not load the list: ",". Открой raw-ссылку напрямую.":". Open the raw link directly.",
"Список скопирован в буфер обмена.":"List copied to clipboard.","Текст выделен — нажми Ctrl+C.":"Text selected — press Ctrl+C.",
"Индексирую страницы сайта…":"Indexing site pages…","Ничего не найдено. Попробуй другое название или ключевое слово.":"No results. Try another name or keyword.",
"ГОТОВО · ":"READY · "," РЕЗУЛЬТАТОВ · ПОИСК ПО ВСЕМУ САЙТУ":" RESULTS · SITE-WIDE SEARCH",
" МАТЕРИАЛОВ":" ITEMS","ИНДЕКСИРУЮ СТРАНИЦЫ И РЕПОЗИТОРИИ…":"INDEXING PAGES AND REPOSITORIES…",
"ПОИСК ПО ДОСТУПНЫМ СТРАНИЦАМ":"SEARCHING AVAILABLE PAGES",
"размер неизвестен":"size unknown","КиБ":"KiB","МиБ":"MiB","ГиБ":"GiB","ТиБ":"TiB",
"Ссылка имеет неверный формат.":"The link format is invalid.","Нужна ссылка, начинающаяся с magnet:?":"A magnet link must start with magnet:?",
"В ссылке не найден поддерживаемый infohash (xt=urn:btih или btmh).":"No supported infohash was found (xt=urn:btih or btmh).",
"Сначала вставь magnet-ссылку.":"Paste a magnet link first.",
"Загружаю WebTorrent и проверяю поддержку WebRTC…":"Loading WebTorrent and checking WebRTC support…",
"Этот браузер или текущая среда не поддерживает WebRTC, необходимый для браузерного BitTorrent.":"This browser or environment does not support WebRTC, which browser BitTorrent requires.",
"Ошибка BitTorrent-клиента: ":"BitTorrent client error: ","неизвестная ошибка":"unknown error",
"Ищу WebRTC-пиров и запрашиваю метаданные. Это может занять несколько минут…":"Looking for WebRTC peers and requesting metadata. This may take a few minutes…",
"За 3 минуты метаданные не получены. Вероятно, в этой раздаче нет доступных WebRTC-пиров.":"Metadata was not received within 3 minutes. This torrent probably has no reachable WebRTC peers.",
"Ожидаю метаданные. Предупреждение: ":"Waiting for metadata. Warning: ",
"Не удалось получить метаданные: ":"Could not retrieve metadata: ","ошибка BitTorrent":"BitTorrent error",
"Метаданные получены, но WebTorrent не смог сформировать .torrent-файл.":"Metadata was received, but WebTorrent could not create a .torrent file.",
"неизвестен":"unknown"," файлов · ":" files · ",
"Метаданные получены. .torrent-файл готов к сохранению.":"Metadata received. The .torrent file is ready to save.",
"Не удалось загрузить WebTorrent: ":"Could not load WebTorrent: ","ошибка загрузки библиотеки":"library loading error",
"Ожидаю magnet-ссылку.":"Waiting for a magnet link.","Получение метаданных остановлено.":"Metadata retrieval stopped.",
"Загрузка .torrent отправлена браузеру.":"The .torrent download was handed to the browser.",
"Последние доступные данные":"Last available data","Проверено: ":"Checked: ","Первая проверка ещё не выполнена":"First check has not run yet",
"Не удалось загрузить статистику (":"Could not load statistics (",
"Собери конфигурацию WireGuard или AmneziaWG 2.0 на основе параметров своего Cloudflare WARP-аккаунта.":"Build a WireGuard or AmneziaWG 2.0 configuration from your Cloudflare WARP account parameters.",
"S1–S4 и H1–H4 зафиксированы в WARP-совместимых значениях: S = 0, H = 1 / 2 / 3 / 4. Эти поля не рандомизируются, чтобы не нарушить совместимость со стандартным WireGuard peer Cloudflare.":"S1–S4 and H1–H4 use fixed WARP-compatible values: S = 0, H = 1 / 2 / 3 / 4. They are not randomized to preserve compatibility with Cloudflare's standard WireGuard peer.",
"Генерация файла не проверяет доступность endpoint из твоей сети и не гарантирует соединение.":"File generation does not test endpoint reachability from your network or guarantee a connection.",
"Внешний генератор нового аккаунта:":"External new-account generator:",
"исходный код ↗":"source code ↗","Движок:":"Engine:",
"Узнай свой публичный IPv4 и IPv6, скопируй адрес и посмотри параметры браузера и сети":"Check your public IPv4 and IPv6, copy the address and view browser and network details",
"Параметры сети браузера доступны не во всех браузерах и могут быть приблизительными.":"Browser network details are not exposed by every browser and may be approximate.",
"Проверяй DNS-записи домена через зашифрованный DNS-over-HTTPS запрос":"Look up domain DNS records through an encrypted DNS-over-HTTPS request",
"— сообщают клиенту адреса пиров конкретной раздачи.":"— tell the client about peers for a specific torrent.",
"— распределённый поиск пиров без центрального трекера.":"— distributed peer discovery without a central tracker.",
"— обмен адресами пиров между подключёнными участниками.":"— exchange peer addresses between connected participants.",
"GitHub проекта ↗":"Project on GitHub ↗","Скопировано":"Copied",
"Релизы":"Releases",
"Язык":"Language",
"ОТКРЫТЫЙ КОД":"OPEN SOURCE",
"СЕТЬ / ДИАГНОСТИКА":"NETWORK / DIAGNOSTICS",
"СЕТЬ / DNS":"NETWORK / DNS",
"СЕТЬ / VPN":"NETWORKING / VPN",
"BITTORRENT / ЭКСПЕРИМЕНТ":"BITTORRENT / EXPERIMENTAL",
"ЛИЧНАЯ БИБЛИОТЕКА":"PERSONAL LIBRARY",
"ТОРРЕНТ / РАЗДАЧИ":"TORRENT / SHARES",
"ТОРРЕНТ / КЛИЕНТ":"TORRENT / CLIENT",
"MAKAKAIglitch — главная":"MAKAKAIglitch — home",
"Ключ интерфейса (base64)":"Interface key (base64)",
"Например: 172.16.0.2/32":"Example: 172.16.0.2/32",
"Публичный ключ Cloudflare":"Cloudflare public key",
"Оставь пустым, если его нет":"Leave empty if not available",
"Здесь появится готовая конфигурация...":"Your generated configuration will appear here...",
"Браузер не предоставляет эти данные":"Not exposed by browser",
"Запрос завершён:":"Query completed:",
"Не удалось выполнить DNS-запрос:":"Could not complete DNS query:",
"Открыть на GitHub":"Open on GitHub",
"репозиториев":"repositories",
"форков":"forks",
"Кэш обновлён":"Cache updated",
"Вклад":"Contributors",
"Последнее обновление":"Last updated",
"Открыть репозиторий":"Open repository",
"Скачивания последних 100 релизов":"Downloads from the latest 100 releases",
"Коммиты":"Commits",
"Ветки":"Branches",
"Источник форка":"Forked from",
"Форк":"Fork",
"СЕТЕВЫЕ ИНСТРУМЕНТЫ":"NETWORK UTILITIES",
"Локальная библиотека":"Local library",
"Больше форков":"Most forks",
"Архив":"Archived",
"Скачивания последних 1000 релизов":"Downloads from the latest 1,000 releases",
"Контрибьюторы":"Contributors",
"Отключён":"Retired",
"Сервис закрыт":"Service discontinued",
"Публичный DNS Mullvad (DoH/DoT) отключён 2 ноября 2026. Адрес оставлен только как историческая ссылка.":"Mullvad public DNS (DoH/DoT) was shut down on November 2, 2026. This endpoint is kept for historical reference only.",
"Mullvad не публиковал официальный публичный DoQ endpoint. Его публичный DNS-сервис закрыт 2 ноября 2026.":"Mullvad did not publish an official public DoQ endpoint. Its public DNS service was shut down on November 2, 2026.",
"Mullvad (закрыт)":"Mullvad (retired)",
"Mullvad (DoQ не опубликован)":"Mullvad (no published DoQ)",
"Актуально":"Current",
"Проверено:":"Checked:",
"Скачать torrent-файл War Thunder в фоне":"Download War Thunder torrent in the background",
"Скачать torrent-файл Enlisted в фоне":"Download Enlisted torrent in the background",
"Фоновая загрузка torrent-файлов":"Background torrent downloads",
"GitHub вернул HTTP":"GitHub returned HTTP",
"Загружено трекеров:":"Trackers loaded:",
"Источник:":"Source:",
"Не удалось загрузить список:":"Could not load list:",
"Открой raw-ссылку напрямую.":"Open the raw link directly.",
"Импортировано полей:":"Imported fields:",
"Проверь их перед сборкой.":"Review them before building.",
"нужен корректный Base64-ключ длиной 32 байта.":"must be a valid 32-byte Base64 key.",
"укажи целое число.":"enter a whole number.",
"диапазон":"allowed range",
"проверь значение.":"check the value.",
"AllowedIPs: используй CIDR/IP через запятую.":"AllowedIPs: use comma-separated IP addresses or CIDR ranges.",
"Ошибка BitTorrent-клиента:":"BitTorrent client error:",
"Не удалось получить метаданные:":"Could not retrieve metadata:",
"Не удалось загрузить WebTorrent:":"Could not load WebTorrent:",
"Не удалось получить метаданные.":"Could not retrieve metadata.",
"Нет названия":"Untitled",
"РАЗДЕЛЫ":"SECTIONS",
"0 РЕЗУЛЬТАТОВ":"0 RESULTS",
"РЕЗУЛЬТАТОВ · ПОИСК ПО ВСЕМУ САЙТУ":"RESULTS · SEARCH THE ENTIRE SITE",
"ГОТОВО ·":"READY ·",
"МАТЕРИАЛОВ":"ITEMS",
"ИНДЕКСИРУЮ СТРАНИЦЫ САЙТА…":"INDEXING SITE PAGES…",
"Страница":"Page",
"Файлы последнего релиза":"Latest release files",
"скачиваний":"downloads",
"Сайт проекта":"Project website"
,"Выбери важные параметры — готовый WARP-профиль соберётся во внешнем генераторе и будет доступен для скачивания в .conf.":"Choose the settings you need. The external generator will build a WARP profile that you can download as a .conf file."
,"Новый WARP-конфиг":"New WARP configuration"
,"По умолчанию уже выбраны безопасные настройки: AmneziaWG 2.0, DNS Cloudflare, UDP 4500, обычный профиль устройства и полный туннель.":"Recommended defaults are selected: AmneziaWG 2.0, Cloudflare DNS, UDP 4500, universal device profile and full tunnel."
,"Формат клиента":"Client format"
,"AmneziaWG 2.0 — рекомендуется":"AmneziaWG 2.0 — recommended"
,"AmneziaWG Legacy 1.5":"AmneziaWG Legacy 1.5"
,"AmneziaWG 3.0":"AmneziaWG 3.0"
,"AmneziaWG 3.1":"AmneziaWG 3.1"
,"DNS-сервер":"DNS resolver"
,"UDP-порт WARP":"WARP UDP port"
,"4500 · стандартный":"4500 · default"
,"Профиль устройства":"Device profile"
,"Обычный · ПК и универсальные клиенты":"Universal · PC and general clients"
,"Мобильный · Android / iOS":"Mobile · Android / iOS"
,"Роутер · OpenWrt / Keenetic / MikroTik":"Router · OpenWrt / Keenetic / MikroTik"
,"Мобильный + роутер":"Mobile + router"
,"Endpoint":"Endpoint"
,"Автоматический · свежая проверка Endpoint Lab":"Automatic · freshly checked by Endpoint Lab"
,"Домен Cloudflare · engage.cloudflareclient.com":"Cloudflare hostname · engage.cloudflareclient.com"
,"Протокол CPS / I1":"CPS / I1 protocol"
,"Auto · стабильные варианты":"Auto · stable options"
,"Экспериментальные":"Experimental"
,"IPv6":"IPv6"
,"Добавить IPv6-маршрутизацию в туннель":"Add IPv6 routes to the tunnel"
,"Дополнительные CPS-пакеты I2–I5":"Additional CPS packets I2–I5"
,"Для современных совместимых клиентов AWG 2.0 / 3.x":"For compatible modern AWG 2.0 / 3.x clients"
,"Перейти к созданию готового .conf":"Continue to create the .conf"
,"Открыть генератор с выбранными настройками ↗":"Open generator with selected settings ↗"
,"Настройки применятся автоматически при открытии генератора.":"Settings are applied automatically when the generator opens."
,"Как работает генерация.":"How generation works."
,"GitHub Pages — статический хостинг: он не может самостоятельно регистрировать WARP-устройство и выдавать новые ключи. Поэтому кнопка открывает":"GitHub Pages is static hosting: it cannot register a WARP device or issue new keys by itself. This button opens"
,"Исходный код ↗":"Source code ↗"
,"Ручной режим":"Manual mode"
,"Импорт своего .conf и редактирование существующих ключей":"Import an existing .conf and edit its keys"
,"Хороший баланс совместимости и дополнительных возможностей. Для 3.x нужны новые версии клиента.":"A good balance of compatibility and features. AWG 3.x requires newer clients."
,"DNS будет записан в конфигурацию клиента.":"The selected DNS resolver will be written to the client configuration."
,"Меняй порт, если UDP на стандартном порту не проходит через сеть.":"Change the port if UDP on the default port is blocked by your network."
,"Мобильный профиль автоматически отключает IPv6 и уменьшает нагрузку от шумовых пакетов.":"The mobile profile automatically disables IPv6 and reduces junk-packet overhead."
,"Автоматический режим использует проверенные адреса, когда они доступны; иначе сервис объяснит причину.":"Automatic mode uses checked endpoints when available; otherwise the service explains why."
,"Auto выбирает стабильный вариант. Экспериментальные режимы могут хуже работать в отдельных сетях.":"Auto selects a stable option. Experimental modes may work less reliably on some networks."
,"Выбран экспериментальный CPS-режим. Совместимость и проходимость зависят от сети; при проблемах верни Auto.":"An experimental CPS mode is selected. Compatibility depends on the network; switch back to Auto if it causes problems."
,"Экспериментальный режим. Для начала лучше Auto или стабильные варианты.":"Experimental mode. Auto or a stable option is a better starting point."
,"Совместимость со старыми клиентами AmneziaWG 1.5.":"For compatibility with older AmneziaWG 1.5 clients."
,"Для AmneziaWG 3.0 нужен клиент с поддержкой AWG 3.0.":"AmneziaWG 3.0 requires a client that supports AWG 3.0."
,"Для AmneziaWG 3.1 нужен актуальный клиент с поддержкой AWG 3.1.":"AmneziaWG 3.1 requires a current client that supports AWG 3.1."
,"WARP-safe профиль для актуальных AmneziaWG 2.0. Хороший вариант по умолчанию.":"WARP-safe profile for current AmneziaWG 2.0 clients. A good default."
,"Настройки подготовлены. Открывается внешний генератор; на его странице нажми Generate, затем скачай .conf.":"Settings are ready. The external generator is opening; click Generate there, then download the .conf file."
,"Автоматический DNS":"Automatic DNS"
,"Local config builder":"Local config builder"

,"Выбери параметры — получи новый WARP-ключ и скачай готовый .conf прямо здесь, без перехода на другую страницу.":"Choose your settings, get a new WARP key and download the .conf right here without leaving this page."
,"Формат конфига":"Configuration format"
,"AWG 2.0 добавляет параметры шумовых пакетов. WireGuard — обычный конфиг без маскировки.":"AWG 2.0 adds junk-packet parameters. WireGuard is a standard config without obfuscation."
,"Выбранные DNS-адреса попадут в секцию Interface.":"The selected DNS addresses will be written to the Interface section."
,"4500 · по умолчанию":"4500 · default"
,"Порт указывается в Endpoint готового файла.":"The selected port is written to the file's Endpoint."
,"Универсальный · ПК":"Universal · PC"
,"Мобильный · Android / iOS":"Mobile · Android / iOS"
,"Роутер · OpenWrt / Keenetic / MikroTik":"Router · OpenWrt / Keenetic / MikroTik"
,"Мобильный профиль отключает IPv6 по умолчанию; профиль роутера снижает шумовую нагрузку.":"The mobile profile disables IPv6 by default; the router profile reduces junk-packet overhead."
,"Адрес сервера":"Server endpoint"
,"Cloudflare hostname · стабильный":"Cloudflare hostname · stable"
,"Случайный Cloudflare anycast IPv4":"Random Cloudflare anycast IPv4"
,"По умолчанию engage.cloudflareclient.com; второй вариант выбирает адрес из стандартных Cloudflare WARP-подсетей.":"Defaults to engage.cloudflareclient.com; the second option picks an address from standard Cloudflare WARP subnets."
,"Профиль шумовых пакетов AWG":"AWG junk-packet profile"
,"Сбалансированный · Jc 4 / 40–70":"Balanced · Jc 4 / 40–70"
,"Лёгкий · Jc 2 / 40–64":"Light · Jc 2 / 40–64"
,"Без шумовых пакетов":"No junk packets"
,"Используется только при формате AmneziaWG 2.0. Для WireGuard эти параметры не добавляются.":"Only used with AmneziaWG 2.0. These parameters are omitted for WireGuard."
,"1280 — безопасная отправная точка для мобильных и нестабильных сетей.":"1280 is a safe starting point for mobile and unstable networks."
,"Поддерживает NAT-сессию; 25 секунд — обычное значение.":"Keeps a NAT mapping alive; 25 seconds is a common value."
,"Добавить IPv6-адрес и маршрут ::/0":"Add an IPv6 address and the ::/0 route"
,"AWG packet obfuscation":"AWG packet obfuscation"
,"Включить Jc/Jmin/Jmax и S/H для AmneziaWG 2.0":"Include Jc/Jmin/Jmax and S/H parameters for AmneziaWG 2.0"
,"Сгенерировать и скачать .conf":"Generate and download .conf"
,"Генерация выполняется в этой вкладке. Файл скачивается автоматически.":"Generation runs in this tab. The file downloads automatically."
,"Готовая конфигурация":"Generated configuration"
,"Скачать ещё раз":"Download again"
,"Файл содержит приватный ключ. Не публикуй и не отправляй его посторонним.":"The file contains a private key. Do not publish it or share it with others."
,"Как это работает.":"How it works."
,"GitHub Pages запускает интерфейс и сборку файла в браузере. Для регистрации нового WARP-устройства используется публичный API-сервис, как и в":"GitHub Pages runs the interface and builds the file in your browser. A public API service registers a new WARP device, just like"
,"API создаёт профиль и возвращает ключи; сайт собирает .conf и не сохраняет его на сервере.":"The API creates the profile and returns its keys; this site builds the .conf and does not store it on its server."
,"Важно:":"Important:"
,"приватный ключ создаётся сторонним API, поэтому оператор этого API потенциально может его видеть. Если такой уровень доверия не подходит, используй ручной режим с уже имеющимся конфигом.":"the private key is created by a third-party API, so that API operator may be able to see it. If you do not trust that service, use the manual mode with an existing config."
,"Получаю новый WARP-профиль · API ":"Requesting a new WARP profile · API "
,"Получаю ключи и собираю конфиг…":"Getting keys and building the config…"
,"Собираю ":"Building "
," конфигурацию…":" configuration…"
,"Не удалось получить WARP-аккаунт ни от одного API. ":"Could not obtain a WARP account from any API. "
,"тайм-аут":"timeout"
,"CORS или сеть не разрешили запрос":"CORS or network policy blocked the request"
,"API вернул пустой ответ.":"The API returned an empty response."
,"API не вернул корректный PrivateKey.":"The API did not return a valid PrivateKey."
,"API не вернул корректный публичный ключ WARP.":"The API did not return a valid WARP public key."
,"API не вернул IPv4-адрес WARP.":"The API did not return a WARP IPv4 address."
,"Выбран неизвестный DNS-сервер.":"Unknown DNS resolver selected."
,"Недопустимый UDP-порт.":"Invalid UDP port."
,"MTU должен быть в диапазоне 576–1500.":"MTU must be between 576 and 1500."
,"Недопустимый PersistentKeepalive.":"Invalid PersistentKeepalive value."
,"Неизвестный формат конфигурации.":"Unknown configuration format."
,"Неизвестный Endpoint.":"Unknown endpoint."
,"В выбранном DNS нет IPv4-адресов.":"The selected DNS resolver has no IPv4 addresses."
,"Готово. Файл ":"Done. File "
," скачивается в этой вкладке. Создан новый WARP-профиль.":" is downloading in this tab. A new WARP profile was created."
,"Конфигурация скопирована.":"Configuration copied."
,"Текст выделен — нажми Ctrl+C.":"Text selected — press Ctrl+C."
,"AmneziaWG 2.0 с дополнительными J/S/H параметрами. I1/CPS-подпись здесь не добавляется.":"AmneziaWG 2.0 with additional J/S/H parameters. An I1/CPS signature is not added here."
,"Обычный WireGuard без параметров AmneziaWG.":"Standard WireGuard without AmneziaWG parameters."

,"Расчёт времени скачивания по размеру файла и скорости интернета с поддержкой Мбит/с и МБ/с.":"Estimate download time from file size and internet speed, with Mbit/s and MB/s support."
,"Рассчитай, сколько времени займёт скачивание файла при заданном размере и скорости соединения.":"Estimate how long a file download will take at the selected file size and connection speed."
,"Параметры загрузки":"Download parameters"
,"Укажи размер файла и скорость скачивания.":"Enter the file size and download speed."
,"Размер файла":"File size"
,"Скорость загрузки":"Download speed"
,"Единица размера файла":"File size unit"
,"Единица скорости":"Speed unit"
,"Примерное время скачивания":"Estimated download time"
,"Скорость в байтах":"Speed in bytes"
,"Размер в байтах":"Size in bytes"
,"Рассчитать":"Calculate"
,"Сбросить":"Reset"
,"Расчёт выполняется прямо в браузере.":"The calculation runs directly in your browser."
,"Быстрый выбор":"Quick presets"
,"Готовые размеры файлов и скорости.":"Common file sizes and connection speeds."
,"Скорость соединения":"Connection speed"
,"Биты и байты — не одно и то же":"Bits and bytes are not the same"
,"Провайдеры обычно указывают скорость в Mbit/s (Мбит/с), а браузеры и загрузчики часто показывают MB/s (МБ/с). В одном байте 8 бит, поэтому 100 Mbit/s — это максимум 12.5 MB/s до учёта накладных расходов.":"Internet providers usually advertise speeds in Mbit/s, while browsers and download clients often show MB/s. One byte contains 8 bits, so 100 Mbit/s equals a maximum of 12.5 MB/s before overhead."
,"Расчёт полностью локальный: размер файла и скорость не отправляются на сервер. Реальное время зависит от нагрузки сети, сервера и протокольных накладных расходов.":"The calculation is fully local: file size and speed are not sent to a server. Actual time depends on network and server load and protocol overhead."
,"Укажи корректный размер файла.":"Enter a valid file size."
,"Скорость должна быть больше нуля.":"Speed must be greater than zero."
,"Неизвестная единица измерения.":"Unknown measurement unit."
,"Слишком большое значение для расчёта.":"The value is too large to calculate."
,"Расчёт обновлён. Скорость считается постоянной.":"Estimate updated. Speed is assumed to remain constant."
,"Проверь, какие публичные IP, WebRTC-кандидаты и DNS-резолверы видны из этой вкладки браузера":"Check which public IP addresses, WebRTC candidates and DNS resolvers are visible to this browser tab."
,"Сравни соединение до и после подключения VPN":"Compare your connection before and after connecting a VPN."
,"Проверка утечек":"Leak test"
,"Сохрани исходное состояние своей сети.":"Save the baseline state of your network."
,"Подключи VPN в обычном приложении или системе.":"Connect your VPN in the usual app or system."
,"Сравни IP и DNS с исходным результатом.":"Compare IP and DNS with the baseline result."
,"Сохранить контрольный результат (без VPN)":"Save baseline result (VPN off)"
,"Проверить текущее соединение":"Test current connection"
,"Контрольный результат ещё не сохранён":"No baseline result saved yet"
,"Публичный IPv4":"Public IPv4"
,"Публичный IPv6":"Public IPv6"
,"DNS leak test":"DNS leak test"
,"Ожидает проверки":"Waiting for test"
,"Обнаруженные DNS-резолверы":"Detected DNS resolvers"
,"WebRTC-кандидаты":"WebRTC candidates"
,"Внешняя DNS-проверка":"External DNS test"
,"Открой независимый DNS leak test, если браузер или сеть блокируют запросы к сервису проверки.":"Open an independent DNS leak test if the browser or network blocks requests to the test service."
,"Что именно проверяется":"What is being tested"
,"Проверки разделены, потому что IP, WebRTC и DNS используют разные сетевые пути.":"The checks are separate because IP, WebRTC and DNS use different network paths."
,"Адреса, которые видят внешние сервисы.":"Addresses visible to external services."
,"IP-кандидаты, которые браузер может раскрыть через STUN.":"IP candidates that the browser may expose through STUN."
,"Рекурсивные DNS-серверы, пришедшие к тестовой авторитетной зоне.":"Recursive DNS servers observed by the test's authoritative zone."
,"DNS-тест использует bash.ws: сервис получает уникальный идентификатор теста и видит IP DNS-резолверов, которые запрашивают уникальные имена. Эти данные передаются стороннему сервису.":"The DNS test uses bash.ws: the service issues a unique test ID and observes the IP addresses of DNS resolvers requesting unique names. This data is sent to a third-party service."
,"Контрольный результат сохранён в памяти этой вкладки":"Baseline result saved in this tab's memory"
,"Сначала сохрани контрольный результат без VPN.":"Save a baseline result with the VPN off first."
,"Снимаю контрольный результат без VPN…":"Collecting baseline result with VPN off…"
,"Проверяю текущее соединение…":"Checking the current connection…"
,"Исходный результат сохранён. Подключи VPN и запусти проверку ещё раз.":"Baseline saved. Connect your VPN and run the test again."
,"Проверка завершена. Сравни предупреждения с исходным результатом.":"Test complete. Compare warnings with the baseline result."
,"Проверка завершена. Сохрани результат без VPN, чтобы получить сравнение.":"Test complete. Save a result with VPN off to enable comparison."
,"Проверка выполняется…":"Test in progress…"
,"Контрольный IPv4: ":"Baseline IPv4: "
,"Контрольный IPv6: ":"Baseline IPv6: "
,"Контрольные WebRTC-кандидаты: ":"Baseline WebRTC candidates: "
,"Контрольных DNS-резолверов: ":"Baseline DNS resolvers: "
,"IPv4 недоступен в этой сети":"IPv4 is unavailable on this network"
,"IPv6 не обнаружен; это не ошибка само по себе":"IPv6 was not detected; this is not necessarily an error"
,"Публичных WebRTC-кандидатов не обнаружено":"No public WebRTC candidates were detected"
,"DNS-резолверы не обнаружены":"No DNS resolvers were detected"
,"DNS-резолверы не получены":"DNS resolvers were not returned"
,"Публичные WebRTC-кандидаты не совпали с контрольными адресами.":"Public WebRTC candidates did not match the baseline addresses."
,"Обнаружен контрольный публичный IP в WebRTC: ":"A baseline public IP was found in WebRTC: "
,"Дополнительные публичные WebRTC-адреса: ":"Additional public WebRTC addresses: "
,"Это требует проверки, но не всегда означает утечку.":"This needs review but does not always indicate a leak."
,"Публичные WebRTC-кандидаты не получены; UDP/STUN может быть заблокирован.":"No public WebRTC candidates were returned; UDP/STUN may be blocked."
,"Те же DNS-резолверы видны после включения VPN: ":"The same DNS resolvers are visible after enabling the VPN: "
,". Это повод проверить маршрут DNS, но само совпадение IP не доказывает утечку.":". Review the DNS route; a matching IP alone does not prove a leak."
,"Набор DNS-резолверов отличается от контрольного. Это не является самостоятельным доказательством отсутствия утечки.":"The DNS resolver set differs from the baseline. This alone does not prove that there is no leak."
,"Набор обнаруженных DNS-резолверов изменился.":"The detected DNS resolver set changed."
,"ASN, организация, провайдер, BGP-маршрут, RIR, reverse DNS и примерная геолокация IP":"ASN, organization, provider, BGP route, RIR, reverse DNS and approximate IP geolocation"
,"Информация об IP-адресе":"IP address intelligence"
,"Можно проверить свой адрес или ввести любой публичный IPv4 / IPv6":"Check your own address or enter any public IPv4 / IPv6 address"
,"IP-адрес":"IP address"
,"Найти":"Look up"
,"Мой IP":"My IP"
,"Копировать IP":"Copy IP"
,"Определяем текущий публичный IP…":"Detecting the current public IP…"
,"Сетевые данные":"Network data"
,"Регистрация адреса и глобальная маршрутизация":"Address registration and global routing"
,"Организация ASN":"ASN organization"
,"Провайдер (ISP)":"Provider (ISP)"
,"Организация":"Organization"
,"BGP-префикс":"BGP prefix"
,"BGP origin ASN":"BGP origin ASN"
,"RDAP network":"RDAP network"
,"Reverse DNS (PTR)":"Reverse DNS (PTR)"
,"Тип соединения":"Connection type"
,"VPN / Tor detection":"VPN / Tor detection"
,"Географические данные":"Geographic data"
,"Оценка местоположения по IP-базе, не GPS":"IP database location estimate, not GPS"
,"Страна":"Country"
,"Регион":"Region"
,"Город":"City"
,"Координаты":"Coordinates"
,"Радиус точности":"Accuracy radius"
,"Часовой пояс":"Time zone"
,"Геолокация IP приблизительна: обычно это город или область выхода провайдера / VPN. Радиус показывается только тогда, когда его сообщает база.":"IP geolocation is approximate: it usually identifies a city or provider / VPN exit area. The radius is shown only when the database provides it."
,"Карта OpenStreetMap":"OpenStreetMap map"
,"Центр оценки геолокации и её радиус точности":"Estimated location center and its accuracy radius"
,"Ожидание координат…":"Waiting for coordinates…"
,"Примерная область IP-адреса; круг показывает известный радиус погрешности.":"Approximate IP area; the circle shows the reported uncertainty radius."
,"Источники: IPWHOis для ISP и геоданных, RIPEstat RIS для BGP, IANA RDAP bootstrap для RIR и RDAP, Google Public DNS для PTR. Запросы отправляются этим внешним сервисам напрямую из браузера.":"Sources: IPWHOis for ISP and geolocation, RIPEstat RIS for BGP, IANA RDAP bootstrap for RIR and RDAP, Google Public DNS for PTR. Requests are sent directly from your browser to these external services."
,"Введи корректный IPv4 или IPv6 адрес.":"Enter a valid IPv4 or IPv6 address."
,"Получаю сведения из IP, BGP, RDAP и reverse DNS источников…":"Fetching details from IP, BGP, RDAP and reverse DNS sources…"
,"Часть источников не ответила; показаны доступные данные.":"Some sources did not respond; available data is shown."
,"Данные получены. Геолокация IP приблизительна.":"Data retrieved. IP geolocation is approximate."
,"Источники не вернули данные для этого адреса.":"Sources returned no data for this address."
,"Не удалось завершить запрос: ":"Could not complete the lookup: "
,"Определяю публичный IP через IPWHOis…":"Detecting public IP through IPWHOis…"
,"Не удалось определить свой IP: ":"Could not detect your IP: "
,"IP-адрес скопирован.":"IP address copied."
,"Буфер обмена недоступен в этом контексте.":"Clipboard is unavailable in this context."
,"Координаты для карты не получены.":"Coordinates were not returned for the map."
,"Библиотека карты не загрузилась.":"The map library failed to load."
,"Примерная геолокация IP":"Approximate IP geolocation"
,"Центр оценки; круг показывает ориентировочный радиус ±":"Estimated center; circle shows an approximate radius of ±"
,"Точка оценки IP; база не сообщила радиус точности.":"Estimated IP location; the database did not provide an accuracy radius."
,"Источник не публикует радиус точности":"The data source does not publish an accuracy radius"
,"Недоступно":"Unavailable"
,"Не найден в BGP":"Not found in BGP"
,"PTR не опубликован":"No PTR record published"
,"Точность / радиус":"Accuracy / radius"
,"Геолокация IP приблизительна и не является GPS или адресом. В поле точности показывается уровень данных, который вернула база; числовой радиус указывается только при наличии значения в ответе.":"IP geolocation is approximate and is not GPS or a street address. The accuracy field shows the level of detail returned by the database; a numeric radius is shown only when the source provides one."
,"Маркер показывает приблизительный центр IP-геолокации, а не точное местоположение устройства":"The marker shows the approximate center of the IP geolocation, not the device's exact location"
,"Маркер — приблизительная оценка. Круг появляется только если источник вернул числовой радиус ошибки.":"The marker is an approximate estimate. A circle is shown only when the source returns a numeric uncertainty radius."
,"Сообщить об ошибке карты ↗":"Report a map issue ↗"
,"Источники: IPWHOIS (ipwho.is) для ISP и геоданных, RIPEstat RIS для BGP, IANA RDAP bootstrap для RIR и RDAP, Google Public DNS для PTR. Внешние сервисы получают проверяемый IP-адрес. У бесплатного IPWHOIS лимит 1 000 запросов в сутки на домен; данные о VPN/Tor в бесплатный ответ не входят. Числовой радиус геолокации показывается только если он пришёл от источника.":"Sources: IPWHOIS (ipwho.is) for ISP and geolocation, RIPEstat RIS for BGP, IANA RDAP bootstrap for RIR and RDAP, and Google Public DNS for PTR. External services receive the IP address being checked. IPWHOIS Free is limited to 1,000 requests per day per domain; VPN/Tor data is not included in the free response. A numeric geolocation radius is shown only when provided by the source."
,"Источник не вернул тип подключения":"The source did not return a connection type"
,"Нет данных о VPN/Tor в ответе API":"The API response contains no VPN/Tor data"
,"VPN обнаружен базой":"VPN detected by the database"
,"VPN не обнаружен базой":"VPN not detected by the database"
,"Tor обнаружен базой":"Tor detected by the database"
,"Tor не обнаружен базой":"Tor not detected by the database"
,"База указывает город; числовой радиус ошибки не предоставлен":"The database lists a city; no numeric uncertainty radius is provided"
,"База указывает регион; числовой радиус ошибки не предоставлен":"The database lists a region; no numeric uncertainty radius is provided"
,"База указывает страну; числовой радиус ошибки не предоставлен":"The database lists a country; no numeric uncertainty radius is provided"
,"Источник не предоставил сведения о точности":"The source did not provide accuracy details"
,"±":"±"
,"не отмечен базой":"Not flagged by the database",
"General — базовая стратегия":"General — base strategy",
"ALT5 — NOT RECOMMENDED":"ALT5 — NOT RECOMMENDED",
"EXP — экспериментальная":"EXP — experimental",
"В исходном файле Flowseal есть комментарий NOT RECOMMENDED.":"The original Flowseal file contains a NOT RECOMMENDED comment.",
"Имя исходного файла помечает эту стратегию как EXP.":"The source filename marks this strategy as EXP.",
"Нет совпадений":"No matches",
"Найдено: ":"Found: ",
"Оригинальные конфигурации: ":"Original configurations: ",
"Оригинальная стратегия Flowseal":"Original Flowseal strategy",
"22 оригинальных .bat-профиля. Выбранный файл загружается из Flowseal и сохраняет собственные параметры.":"22 original .bat profiles. The selected file is loaded from Flowseal and keeps its original parameters.",
"Оригинальные конфигурации Flowseal ↗":"Original Flowseal configurations ↗",
"Зависимости bin будут показаны после загрузки профиля.":"bin dependencies will be shown after the profile loads.",
"Файлы, которые профиль ожидает в bin: ":"Files expected in the bin folder: ",
"В исходном профиле не обнаружены зависимости .bin.":"No .bin dependencies were found in the source profile.",
"Загружен оригинальный ":"Loaded original ",
". Его параметры и порядок правил сохранены; добавлены только выбранные фильтры портов.":". Its parameters and rule order are preserved; only the selected port filters were added.",
"Оригинальные параметры сохранены; WARP-порты добавлены отдельно.":"Original parameters were preserved; WARP ports were added separately.",
"Загружаю оригинальную стратегию Flowseal…":"Loading original Flowseal strategy…",
"Загружаю оригинальный файл ":"Loading original file ",
"Не удалось получить или обработать оригинальный профиль. ":"Could not download or process the original profile. ",
"Проверь доступ к raw.githubusercontent.com или api.github.com.":"Check access to raw.githubusercontent.com or api.github.com.",
"Для V1 нужен Flowseal Windows bundle: winws.exe, bin, lists и service.bat.":"V1 requires the Flowseal Windows bundle: winws.exe, bin, lists and service.bat.",
"Zapret 1 загружает оригинальный .bat из Flowseal. Нужны winws.exe, service.bat, папки bin и lists из совместимой сборки.":"Zapret 1 loads the original .bat from Flowseal. You need winws.exe, service.bat, bin and lists from a compatible build.",
"Оригинальные QUIC-правила Flowseal оставлены без изменений; UDP 443 не добавлялся как WARP-порт.":"Flowseal's original QUIC rules are unchanged; UDP 443 was not added as a WARP port.",
"V1 WireGuard-фильтр использует общий UDP-шаблон выбранного профиля.":"The V1 WireGuard filter uses the selected profile's generic UDP template.",
"Оригинальный .bat загружается из Flowseal при выборе стратегии.":"The original .bat is loaded from Flowseal when a strategy is selected.",
"Оригинальная стратегия Flowseal ↗":"Original Flowseal strategy ↗",
"Оригинальные конфигурации Flowseal ↗":"Original Flowseal configurations ↗",
"В выбранном профиле не найдена исходная GameFilter TCP-стратегия для расширения портов.":"The selected profile has no original GameFilter TCP rule to extend.",
"В выбранном профиле не найдена исходная GameFilter UDP-стратегия для WARP.":"The selected profile has no original GameFilter UDP rule for WARP.",
"В оригинальном .bat не найдена строка запуска winws.exe.":"The original .bat has no winws.exe start line.",
"Не удалось разобрать --wf-tcp/--wf-udp в оригинальном профиле.":"Could not parse --wf-tcp/--wf-udp in the original profile.",
"В оригинальном профиле не найдена QUIC-стратегия для MASQUE-портов.":"The original profile has no QUIC strategy for MASQUE ports.",
"Оригинальные конфигурации Flowseal":"Original Flowseal configurations",
"Поиск по 22 конфигурациям":"Search 22 configurations",
"Например: ALT, FAKE TLS, SIMPLE FAKE...":"For example: ALT, FAKE TLS, SIMPLE FAKE...",
"Зависимости bin будут показаны после загрузки профиля.":"bin dependencies will be shown after the profile loads."
"Генератор 22 оригинальных стратегий Flowseal для zapret 1 и профилей zapret 2 для Windows.":"Generator for 22 original Flowseal strategies for zapret 1 and zapret 2 profiles for Windows.",
"Выбери один из 22 оригинальных профилей Flowseal для zapret 1 или отдельный режим zapret 2 на базе winws2. Порты WARP добавляются отдельно.":"Choose one of 22 original Flowseal profiles for zapret 1 or the separate zapret 2 mode based on winws2. WARP ports are added separately.",
"Оригинальные файлы загружаются из Flowseal при выборе стратегии. Сохраняются исходные параметры выбранного .bat.":"Original files are loaded from Flowseal when a strategy is selected. The chosen .bat parameters are preserved.",
"Например: ALT, FAKE TLS, SIMPLE FAKE...":"For example: ALT, FAKE TLS, SIMPLE FAKE...",
"22 оригинальных конфигурации":"22 original configurations",
"22 оригинальных профиля Flowseal для zapret 1, отдельный режим zapret 2 и дополнительные порты WARP.":"22 original Flowseal profiles for zapret 1, a separate zapret 2 mode and additional WARP ports."

};
const reverse=Object.fromEntries(Object.entries(map).map(([ru,en])=>[en,ru]));
const titleMap={
"/":{ru:"Репозитории — MAKAKAIglitch",en:"Repositories — MAKAKAIglitch"},
"/tools/":{ru:"Утилиты — MAKAKAIglitch",en:"Utilities — MAKAKAIglitch"},
"/tools/warp-generator/":{ru:"WARP Generator — MAKAKAIglitch",en:"WARP Generator — MAKAKAIglitch"},
"/tools/zapret-strategy-generator/":{ru:"Zapret Strategy Generator — MAKAKAIglitch",en:"Zapret Strategy Generator — MAKAKAIglitch"},
"/tools/magnet-to-torrent/":{ru:"Magnet → Torrent — MAKAKAIglitch",en:"Magnet → Torrent — MAKAKAIglitch"},
"/tools/ip-check/":{ru:"IP Check — MAKAKAIglitch",en:"IP Check — MAKAKAIglitch"},
"/tools/dns-lookup/":{ru:"DNS Lookup — MAKAKAIglitch",en:"DNS Lookup — MAKAKAIglitch"},
"/tools/dns-tester/":{ru:"Тестер DNS-серверов — MAKAKAIglitch",en:"DNS Server Tester — MAKAKAIglitch"},
"/tools/download-time/":{ru:"Время загрузки файла — MAKAKAIglitch",en:"Download Time Calculator — MAKAKAIglitch"},
"/tools/vpn-leak-test/":{ru:"VPN Leak Test — MAKAKAIglitch",en:"VPN Leak Test — MAKAKAIglitch"},
"/tools/ip-intelligence/":{ru:"IP Intelligence — MAKAKAIglitch",en:"IP Intelligence — MAKAKAIglitch"},
"/library/":{ru:"Библиотека — MAKAKAIglitch",en:"Library — MAKAKAIglitch"},
"/library/torrent/":{ru:"Torrent — Библиотека — MAKAKAIglitch",en:"Torrent — Library — MAKAKAIglitch"},
"/library/torrent/shares/":{ru:"Раздачи — Torrent — MAKAKAIglitch",en:"Shares — Torrent — MAKAKAIglitch"},
"/library/torrent/client/":{ru:"Настройки клиента — Torrent — MAKAKAIglitch",en:"Client settings — Torrent — MAKAKAIglitch"},
"/library/windows/":{ru:"Windows — Библиотека — MAKAKAIglitch",en:"Windows — Library — MAKAKAIglitch"},
"/library/windows/commands/":{ru:"Команды Windows — MAKAKAIglitch",en:"Windows commands — MAKAKAIglitch"},
"/library/windows/network/":{ru:"Сеть Windows — MAKAKAIglitch",en:"Windows networking — MAKAKAIglitch"},
"/library/windows/diagnostics/":{ru:"Диагностика Windows — MAKAKAIglitch",en:"Windows diagnostics — MAKAKAIglitch"}
,"Язык":"Language"
,"Снимок GitHub обновлён":"GitHub snapshot updated"
,"Скачивания последних 100 релизов":"Downloads from the latest 100 releases"
,"Скачивания последних 1000 релизов":"Downloads from the latest 1000 releases"
,"DNS Server Tester":"DNS Server Tester"
,"Сравни DNS-резолверы, измерь время реального DoH-запроса и выбери подходящий протокол":"Compare DNS resolvers, measure real DoH query latency and choose a protocol"
,"Выбор протокола":"Choose a protocol"
,"HTTPS, TLS и QUIC с отдельными инструкциями и списками серверов":"HTTPS, TLS and QUIC with separate instructions and server lists"
,"Домен для проверки":"Domain to test"
,"Проверить HTTPS-серверы":"Test HTTPS servers"
,"Готово к проверке DoH-серверов":"Ready to test DoH servers"
,"Проверяем серверы…":"Testing servers…"
,"Отправляем DNS-запросы к DoH-серверам…":"Sending DNS queries to DoH servers…"
,"Проверка завершена: ":"Test complete: "
,"серверов ответили для ":"servers responded for "
,"ответов":"answers"
,"попыток":"attempts"
,"Самый быстрый":"Fastest"
,"Проверен":"Tested"
,"Не проверен":"Not tested"
,"Настройка":"Configuration"
,"Ожидает проверки":"Not tested yet"
,"DNS-запрос не выполнялся":"No DNS query was sent"
,"Нет браузерного теста":"No browser test"
,"Нужен отдельный DNS-клиент с поддержкой протокола":"A separate DNS client with protocol support is required"
,"Копировать адрес":"Copy endpoint"
,"Адрес DNS-сервера скопирован.":"DNS server endpoint copied."
,"Не удалось скопировать адрес. Выдели его вручную.":"Could not copy the endpoint. Select it manually."
,"Выбран DoH. Нажми кнопку, чтобы сравнить задержку DNS-запросов.":"DoH selected. Run the test to compare DNS query latency."
,"Для DoT скопируй имя сервера в совместимый DNS-клиент.":"For DoT, copy the server hostname into a compatible DNS client."
,"Для DoQ используй клиент, который поддерживает DNS-over-QUIC.":"For DoQ, use a client that supports DNS-over-QUIC."
,"Где поддерживается HTTPS / DoH":"Where HTTPS / DoH is supported"
,"Firefox поддерживает встроенный и пользовательский URL DNS-over-HTTPS. Windows 11 позволяет задать шаблон DoH для совместимых DNS-серверов. На Android системная настройка «Частный DNS» использует DoT, поэтому для DoH нужно отдельное совместимое приложение или браузер.":"Firefox supports built-in and custom DNS-over-HTTPS URLs. Windows 11 lets you configure a DoH template for compatible resolvers. Android's system Private DNS setting uses DoT, so DoH needs a compatible app or browser."
,"Где поддерживается TLS / DoT":"Where TLS / DoT is supported"
,"Android 9 и новее: Настройки → Сеть и интернет → Частный DNS → имя хоста провайдера. Вводи имя без префикса tls://. На Linux и роутерах DoT доступен через совместимые резолверы и DNS-прокси, например systemd-resolved, Stubby или AdGuard dnsproxy.":"Android 9 and newer: Settings → Network & Internet → Private DNS → provider hostname. Enter the hostname without the tls:// prefix. On Linux and routers, DoT is available through compatible resolvers and DNS proxies such as systemd-resolved, Stubby or AdGuard dnsproxy."
,"Для tls://1.1.1.1 проверка сертификата по IP может не пройти. Для Cloudflare DoT обычно используют имя one.one.one.one с адресом 1.1.1.1.":"For tls://1.1.1.1, certificate validation by IP may fail. Cloudflare DoT commonly uses the hostname one.one.one.one with address 1.1.1.1."
,"Где поддерживается QUIC / DoQ":"Where QUIC / DoQ is supported"
,"DoQ требует отдельного DNS-клиента с поддержкой DNS-over-QUIC. Протокол поддерживают приложения AdGuard для Android и iOS, AdGuard Home и AdGuard dnsproxy. Обычный браузер и стандартное поле Android Private DNS не подключаются к произвольным DoQ-серверам.":"DoQ requires a DNS client with DNS-over-QUIC support. AdGuard apps for Android and iOS, AdGuard Home and AdGuard dnsproxy support it. A normal browser and Android's standard Private DNS field cannot connect to arbitrary DoQ servers."
,"В браузере измеряется время настоящего DNS-запроса через DoH, а не ICMP ping. DoT и DoQ показаны как конфигурации: JavaScript страницы не может напрямую открывать произвольные TCP/TLS и QUIC-соединения. Для них страница не показывает выдуманные значения задержки.":"The browser measures the time of a real DoH DNS query, not ICMP ping. DoT and DoQ are configuration-only here: page JavaScript cannot open arbitrary TCP/TLS or QUIC connections. No latency values are fabricated for them."
,"Не удалось определить IP. Проверь соединение и попробуй снова.":"Could not detect the IP. Check your connection and try again."
,"IPv4 источник: Amazon CheckIP":"IPv4 source: Amazon CheckIP"
,"IPv4 проверяется через checkip.amazonaws.com с резервным переходом на ipify; IPv6 проверяется через ipify. Геолокация и имя провайдера не запрашиваются.":"IPv4 is checked through checkip.amazonaws.com with ipify as a fallback; IPv6 is checked through ipify. Geolocation and ISP name are not requested."
,"Ожидаем ответ от трекеров":"Waiting for tracker responses"
,"Серверы DNS":"DNS servers"

};
function detect(){
 try{const saved=localStorage.getItem(KEY);if(saved==="ru"||saved==="en")return saved;}catch{}
 const langs=navigator.languages?.length?navigator.languages:[navigator.language||"en"];
 for(const item of langs){const code=String(item).toLowerCase().split("-")[0];if(code==="ru")return RU;if(code==="en")return EN;}
 return EN;
}
let lang=detect();
function translateString(value){
 const pairs=lang===EN?Object.entries(map):Object.entries(reverse);
 pairs.sort((a,b)=>b[0].length-a[0].length);
 let result=String(value);
 // Translate complete phrases containing the map brand first, then protect
 // the brand itself from shorter dictionary entries such as "Open" → "Открыть".
 for(const [from,to] of pairs)if(from.includes("OpenStreetMap"))result=result.split(from).join(to);
 const brandTokens=[];
 result=result.replace(/OpenStreetMap/g,()=>{
  const token="\\uE000OSM"+brandTokens.length+"\\uE001";
  brandTokens.push(token);
  return token;
 });
 for(const [from,to] of pairs)if(from&&!from.includes("OpenStreetMap"))result=result.split(from).join(to);
 brandTokens.forEach((token,index)=>{result=result.split(token).join("OpenStreetMap");});
 return result;
}
function t(value){return translateString(value);}
function translateNode(node){
 const value=node.nodeValue;if(!value||!value.trim())return;
 const dest=translateString(value);
 if(dest!==value)node.nodeValue=dest;
}
function apply(root=document.body){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;if(!p||["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","CODE","PRE"].includes(p.tagName))return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
 }});
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(translateNode);
 const all=[];if(root.nodeType===1)all.push(root);all.push(...(root.querySelectorAll?.("*")||[]));
 for(const el of all)for(const attr of ["placeholder","aria-label","title"]){
  const value=el.getAttribute(attr);if(!value)continue;const dest=translateString(value);if(dest!==value)el.setAttribute(attr,dest);
 }
}
function buildControl(){
 const top=document.querySelector(".topbar"),host=top?.querySelector(".topbar-actions")||top;
 if(!host||host.querySelector(".language-switcher"))return;
 const wrap=document.createElement("label");wrap.className="language-switcher";wrap.setAttribute("aria-label",t("Язык"));
 const select=document.createElement("select");select.className="language-select";select.setAttribute("aria-label",t("Язык"));
 select.innerHTML='<option value="ru">RU</option><option value="en">EN</option>';select.value=lang;
 select.addEventListener("change",()=>setLanguage(select.value,true));wrap.append(select);
 const search=host.querySelector(".global-search-trigger");
 if(search)host.insertBefore(wrap,search.nextSibling);else host.appendChild(wrap);
}
function setLanguage(next,persist=false){
 lang=next==="en"?EN:RU;document.documentElement.lang=lang;
 const select=document.querySelector(".language-select");if(select)select.value=lang;
 if(titleMap[location.pathname])document.title=titleMap[location.pathname][lang];
 apply();document.dispatchEvent(new CustomEvent("site:language-change",{detail:{language:lang}}));
 if(persist)try{localStorage.setItem(KEY,lang);}catch{}
}
window.siteI18n={get language(){return lang;},t,setLanguage};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{buildControl();setLanguage(lang);},{once:true});
else{buildControl();setLanguage(lang);}
new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{
 if(n.nodeType===3)translateNode(n);else if(n.nodeType===1)apply(n);
}))).observe(document.documentElement,{childList:true,subtree:true});
})();
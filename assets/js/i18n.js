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
"Mullvad (DoQ не опубликован)":"Mullvad (no published DoQ)"
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
};
const reverse=Object.fromEntries(Object.entries(map).map(([ru,en])=>[en,ru]));
const titleMap={
"/":{ru:"Репозитории — MAKAKAIglitch",en:"Repositories — MAKAKAIglitch"},
"/tools/":{ru:"Утилиты — MAKAKAIglitch",en:"Utilities — MAKAKAIglitch"},
"/tools/warp-generator/":{ru:"WARP Generator — MAKAKAIglitch",en:"WARP Generator — MAKAKAIglitch"},
"/tools/magnet-to-torrent/":{ru:"Magnet → Torrent — MAKAKAIglitch",en:"Magnet → Torrent — MAKAKAIglitch"},
"/tools/ip-check/":{ru:"IP Check — MAKAKAIglitch",en:"IP Check — MAKAKAIglitch"},
"/tools/dns-lookup/":{ru:"DNS Lookup — MAKAKAIglitch",en:"DNS Lookup — MAKAKAIglitch"},
"/tools/dns-tester/":{ru:"Тестер DNS-серверов — MAKAKAIglitch",en:"DNS Server Tester — MAKAKAIglitch"},
"/library/":{ru:"Библиотека — MAKAKAIglitch",en:"Library — MAKAKAIglitch"},
"/library/torrent/":{ru:"Torrent — Библиотека — MAKAKAIglitch",en:"Torrent — Library — MAKAKAIglitch"},
"/library/torrent/shares/":{ru:"Раздачи — Torrent — MAKAKAIglitch",en:"Shares — Torrent — MAKAKAIglitch"},
"/library/torrent/client/":{ru:"Настройки клиента — Torrent — MAKAKAIglitch",en:"Client settings — Torrent — MAKAKAIglitch"}
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
 let result=String(value);
 const pairs=lang===EN?Object.entries(map):Object.entries(reverse);
 pairs.sort((a,b)=>b[0].length-a[0].length);
 for(const [from,to] of pairs)if(from)result=result.split(from).join(to);
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
const CHECK_INTERVAL_SECONDS = 300;
const RETENTION_DAYS = 365;
const DETAILED_RETENTION_DAYS = 30;
const PROBE_TIMEOUT_MS = 8000;
const STATUS_TIMEOUT_MS = 7000;
const MAX_CONCURRENT_SERVICES = 6;

const SERVICES = [
  {
    "id": "telegram",
    "name": "Telegram",
    "category": "communication",
    "symbol": "TG",
    "description": "Telegram Web — доступность веб-клиента",
    "website": "https://web.telegram.org/",
    "probe_url": "https://web.telegram.org/a/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "youtube",
    "name": "YouTube",
    "category": "media",
    "symbol": "YT",
    "description": "YouTube — веб-сайт и видеоплатформа",
    "website": "https://www.youtube.com/",
    "probe_url": "https://www.youtube.com/generate_204",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "google",
    "name": "Google Search",
    "category": "search",
    "symbol": "G",
    "description": "Поисковая система Google",
    "website": "https://www.google.com/",
    "probe_url": "https://www.google.com/generate_204",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "cloudflare",
    "name": "Cloudflare",
    "category": "infrastructure",
    "symbol": "CF",
    "description": "Cloudflare — edge, DNS и CDN",
    "website": "https://www.cloudflare.com/cdn-cgi/trace",
    "probe_url": "https://www.cloudflare.com/cdn-cgi/trace",
    "status_api_url": "https://www.cloudflarestatus.com/api/v2/summary.json",
    "status_page_url": "https://www.cloudflarestatus.com/"
  },
  {
    "id": "github",
    "name": "GitHub",
    "category": "development",
    "symbol": "GH",
    "description": "GitHub — сайт, API и репозитории",
    "website": "https://github.com/",
    "probe_url": "https://github.com/",
    "status_api_url": "https://www.githubstatus.com/api/v2/summary.json",
    "status_page_url": "https://www.githubstatus.com/"
  },
  {
    "id": "discord",
    "name": "Discord",
    "category": "communication",
    "symbol": "DC",
    "description": "Discord — веб-клиент и Gateway",
    "website": "https://discord.com/",
    "probe_url": "https://discord.com/api/v10/gateway",
    "status_api_url": "https://discordstatus.com/api/v2/summary.json",
    "status_page_url": "https://discordstatus.com/"
  },
  {
    "id": "openai",
    "name": "OpenAI / ChatGPT",
    "category": "ai",
    "symbol": "AI",
    "description": "ChatGPT и платформа OpenAI",
    "website": "https://chatgpt.com/",
    "probe_url": "https://chatgpt.com/",
    "status_api_url": "https://status.openai.com/api/v2/summary.json",
    "status_page_url": "https://status.openai.com/"
  },
  {
    "id": "steam",
    "name": "Steam Store",
    "category": "media",
    "symbol": "ST",
    "description": "Steam Store — магазин Steam",
    "website": "https://store.steampowered.com/",
    "probe_url": "https://store.steampowered.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "nextdns",
    "name": "NextDNS",
    "category": "infrastructure",
    "symbol": "ND",
    "description": "NextDNS — тестовый endpoint",
    "website": "https://nextdns.io/",
    "probe_url": "https://test.nextdns.io/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "reddit",
    "name": "Reddit",
    "category": "media",
    "symbol": "R",
    "description": "Reddit — веб-платформа",
    "website": "https://www.reddit.com/",
    "probe_url": "https://www.reddit.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "x",
    "name": "X",
    "category": "communication",
    "symbol": "X",
    "description": "X — социальная платформа",
    "website": "https://x.com/",
    "probe_url": "https://x.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "twitch",
    "name": "Twitch",
    "category": "media",
    "symbol": "TW",
    "description": "Twitch — стриминговая платформа",
    "website": "https://www.twitch.tv/",
    "probe_url": "https://www.twitch.tv/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "category": "media",
    "symbol": "SP",
    "description": "Spotify Web Player",
    "website": "https://open.spotify.com/",
    "probe_url": "https://open.spotify.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "wikipedia",
    "name": "Wikipedia",
    "category": "platform",
    "symbol": "W",
    "description": "Wikipedia — онлайн-энциклопедия",
    "website": "https://www.wikipedia.org/",
    "probe_url": "https://www.wikipedia.org/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "whatsapp",
    "name": "WhatsApp",
    "category": "communication",
    "symbol": "WA",
    "description": "WhatsApp Web",
    "website": "https://web.whatsapp.com/",
    "probe_url": "https://web.whatsapp.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "microsoft",
    "name": "Microsoft",
    "category": "platform",
    "symbol": "MS",
    "description": "Сайт Microsoft",
    "website": "https://www.microsoft.com/",
    "probe_url": "https://www.microsoft.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "steam_community",
    "name": "Steam Community",
    "category": "media",
    "symbol": "SC",
    "description": "Сообщество Steam, профили и обсуждения",
    "website": "https://steamcommunity.com/",
    "probe_url": "https://steamcommunity.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "steam_api",
    "name": "Steam Web API",
    "category": "development",
    "symbol": "SA",
    "description": "Публичный endpoint Steam Web API",
    "website": "https://steamcommunity.com/dev",
    "probe_url": "https://api.steampowered.com/ISteamWebAPIUtil/GetServerInfo/v1/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "yandex_search",
    "name": "Яндекс Поиск",
    "category": "search",
    "symbol": "Я",
    "description": "Поисковая система Яндекса",
    "website": "https://yandex.ru/",
    "probe_url": "https://yandex.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "bing",
    "name": "Bing",
    "category": "search",
    "symbol": "BI",
    "description": "Поисковая система Microsoft Bing",
    "website": "https://www.bing.com/",
    "probe_url": "https://www.bing.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "duckduckgo",
    "name": "DuckDuckGo",
    "category": "search",
    "symbol": "DD",
    "description": "Поисковая система DuckDuckGo",
    "website": "https://duckduckgo.com/",
    "probe_url": "https://duckduckgo.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "anthropic",
    "name": "Anthropic / Claude",
    "category": "ai",
    "symbol": "CL",
    "description": "Claude, Claude Code и Anthropic API",
    "website": "https://claude.ai/",
    "probe_url": "https://claude.ai/",
    "status_api_url": "https://status.claude.com/api/v2/summary.json",
    "status_page_url": "https://status.claude.com/"
  },
  {
    "id": "gemini",
    "name": "Google Gemini",
    "category": "ai",
    "symbol": "GE",
    "description": "Gemini и веб-приложение Google AI",
    "website": "https://gemini.google.com/",
    "probe_url": "https://gemini.google.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "xai",
    "name": "xAI / Grok",
    "category": "ai",
    "symbol": "GX",
    "description": "Grok и xAI API",
    "website": "https://grok.com/",
    "probe_url": "https://grok.com/",
    "status_api_url": "https://status.x.ai/api/v2/summary.json",
    "status_page_url": "https://status.x.ai/"
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "category": "ai",
    "symbol": "PE",
    "description": "Поиск с ИИ и Perplexity API",
    "website": "https://www.perplexity.ai/",
    "probe_url": "https://www.perplexity.ai/",
    "status_api_url": "https://status.perplexity.com/api/v2/summary.json",
    "status_page_url": "https://status.perplexity.com/"
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "category": "ai",
    "symbol": "DS",
    "description": "DeepSeek Chat и API",
    "website": "https://chat.deepseek.com/",
    "probe_url": "https://chat.deepseek.com/",
    "status_api_url": "https://status.deepseek.com/api/v2/summary.json",
    "status_page_url": "https://status.deepseek.com/"
  },
  {
    "id": "mistral",
    "name": "Mistral AI / Le Chat",
    "category": "ai",
    "symbol": "MI",
    "description": "Le Chat и Mistral API",
    "website": "https://chat.mistral.ai/",
    "probe_url": "https://chat.mistral.ai/",
    "status_api_url": "https://status.mistral.ai/api/v2/summary.json",
    "status_page_url": "https://status.mistral.ai/"
  },
  {
    "id": "cohere",
    "name": "Cohere",
    "category": "ai",
    "symbol": "CO",
    "description": "Cohere API и модели",
    "website": "https://cohere.com/",
    "probe_url": "https://cohere.com/",
    "status_api_url": "https://status.cohere.com/api/v2/summary.json",
    "status_page_url": "https://status.cohere.com/"
  },
  {
    "id": "groq",
    "name": "Groq",
    "category": "ai",
    "symbol": "GR",
    "description": "GroqCloud и inference API",
    "website": "https://groq.com/",
    "probe_url": "https://groq.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "huggingface",
    "name": "Hugging Face",
    "category": "ai",
    "symbol": "HF",
    "description": "Hugging Face Hub и Inference",
    "website": "https://huggingface.co/",
    "probe_url": "https://huggingface.co/",
    "status_api_url": "https://status.huggingface.co/api/v2/summary.json",
    "status_page_url": "https://status.huggingface.co/"
  },
  {
    "id": "openrouter",
    "name": "OpenRouter",
    "category": "ai",
    "symbol": "OR",
    "description": "Единый API-роутер языковых моделей",
    "website": "https://openrouter.ai/",
    "probe_url": "https://openrouter.ai/",
    "status_api_url": "https://status.openrouter.ai/api/v2/summary.json",
    "status_page_url": "https://status.openrouter.ai/"
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "category": "ai",
    "symbol": "CU",
    "description": "AI-редактор Cursor и его сервисы",
    "website": "https://cursor.com/",
    "probe_url": "https://cursor.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "gigachat",
    "name": "Сбер / GigaChat",
    "category": "ai",
    "symbol": "GI",
    "description": "GigaChat — ИИ-сервис Сбера",
    "website": "https://giga.chat/",
    "probe_url": "https://giga.chat/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "yandex_ai",
    "name": "Яндекс Алиса / AI",
    "category": "ai",
    "symbol": "YA",
    "description": "Алиса и ИИ-сервисы Яндекса",
    "website": "https://alice.yandex.ru/",
    "probe_url": "https://alice.yandex.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "yandex",
    "name": "Яндекс",
    "category": "russian",
    "symbol": "Я",
    "description": "Портал и основные сервисы Яндекса",
    "website": "https://ya.ru/",
    "probe_url": "https://ya.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "yandex_disk",
    "name": "Яндекс Диск",
    "category": "russian",
    "symbol": "YD",
    "description": "Облачное хранилище Яндекс Диск",
    "website": "https://disk.yandex.ru/",
    "probe_url": "https://disk.yandex.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "vk",
    "name": "ВКонтакте",
    "category": "russian",
    "symbol": "VK",
    "description": "Социальная сеть ВКонтакте",
    "website": "https://vk.com/",
    "probe_url": "https://vk.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "mail_ru",
    "name": "Почта Mail.ru",
    "category": "russian",
    "symbol": "MR",
    "description": "Почта Mail.ru",
    "website": "https://mail.ru/",
    "probe_url": "https://mail.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "dzen",
    "name": "Дзен",
    "category": "russian",
    "symbol": "DZ",
    "description": "Платформа Дзен",
    "website": "https://dzen.ru/",
    "probe_url": "https://dzen.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "rutube",
    "name": "RuTube",
    "category": "russian",
    "symbol": "RT",
    "description": "Российский видеохостинг RuTube",
    "website": "https://rutube.ru/",
    "probe_url": "https://rutube.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "odnoklassniki",
    "name": "Одноклассники",
    "category": "russian",
    "symbol": "OK",
    "description": "Социальная сеть Одноклассники",
    "website": "https://ok.ru/",
    "probe_url": "https://ok.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "gosuslugi",
    "name": "Госуслуги",
    "category": "russian",
    "symbol": "ГУ",
    "description": "Портал государственных услуг",
    "website": "https://www.gosuslugi.ru/",
    "probe_url": "https://www.gosuslugi.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "sber",
    "name": "Сбербанк",
    "category": "finance",
    "symbol": "СБ",
    "description": "Официальный сайт Сбербанка; проверяется веб-доступность",
    "website": "https://www.sberbank.ru/",
    "probe_url": "https://www.sberbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "vtb",
    "name": "ВТБ",
    "category": "finance",
    "symbol": "ВТ",
    "description": "Официальный сайт банка ВТБ",
    "website": "https://www.vtb.ru/",
    "probe_url": "https://www.vtb.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "tbank",
    "name": "Т-Банк",
    "category": "finance",
    "symbol": "ТБ",
    "description": "Официальный сайт Т-Банка",
    "website": "https://www.tbank.ru/",
    "probe_url": "https://www.tbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "alfa",
    "name": "Альфа-Банк",
    "category": "finance",
    "symbol": "АБ",
    "description": "Официальный сайт Альфа-Банка",
    "website": "https://alfabank.ru/",
    "probe_url": "https://alfabank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "gazprombank",
    "name": "Газпромбанк",
    "category": "finance",
    "symbol": "ГП",
    "description": "Официальный сайт Газпромбанка",
    "website": "https://www.gazprombank.ru/",
    "probe_url": "https://www.gazprombank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "sovcombank",
    "name": "Совкомбанк",
    "category": "finance",
    "symbol": "СК",
    "description": "Официальный сайт Совкомбанка",
    "website": "https://sovcombank.ru/",
    "probe_url": "https://sovcombank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "psb",
    "name": "ПСБ",
    "category": "finance",
    "symbol": "ПС",
    "description": "Официальный сайт банка ПСБ",
    "website": "https://www.psbank.ru/",
    "probe_url": "https://www.psbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "rshb",
    "name": "Россельхозбанк",
    "category": "finance",
    "symbol": "РС",
    "description": "Официальный сайт Россельхозбанка",
    "website": "https://www.rshb.ru/",
    "probe_url": "https://www.rshb.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "mkb",
    "name": "Московский кредитный банк",
    "category": "finance",
    "symbol": "МК",
    "description": "Официальный сайт МКБ",
    "website": "https://mkb.ru/",
    "probe_url": "https://mkb.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "mts_bank",
    "name": "МТС Банк",
    "category": "finance",
    "symbol": "МБ",
    "description": "Официальный сайт МТС Банка",
    "website": "https://www.mtsbank.ru/",
    "probe_url": "https://www.mtsbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "domrf_bank",
    "name": "Банк ДОМ.РФ",
    "category": "finance",
    "symbol": "ДР",
    "description": "Официальный сайт Банка ДОМ.РФ",
    "website": "https://domrfbank.ru/",
    "probe_url": "https://domrfbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "zenit_bank",
    "name": "Банк ЗЕНИТ",
    "category": "finance",
    "symbol": "ЗН",
    "description": "Официальный сайт банка ЗЕНИТ",
    "website": "https://www.zenit.ru/",
    "probe_url": "https://www.zenit.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "akbars",
    "name": "Ак Барс Банк",
    "category": "finance",
    "symbol": "АК",
    "description": "Официальный сайт Ак Барс Банка",
    "website": "https://www.akbars.ru/",
    "probe_url": "https://www.akbars.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "bspb",
    "name": "Банк Санкт-Петербург",
    "category": "finance",
    "symbol": "БС",
    "description": "Официальный сайт Банка Санкт-Петербург",
    "website": "https://www.bspb.ru/",
    "probe_url": "https://www.bspb.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "uralsib",
    "name": "Банк Уралсиб",
    "category": "finance",
    "symbol": "УР",
    "description": "Официальный сайт Банка Уралсиб",
    "website": "https://www.uralsib.ru/",
    "probe_url": "https://www.uralsib.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "modulbank",
    "name": "Модульбанк",
    "category": "finance",
    "symbol": "МД",
    "description": "Официальный сайт Модульбанка",
    "website": "https://modulbank.ru/",
    "probe_url": "https://modulbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "absolutbank",
    "name": "Абсолют Банк",
    "category": "finance",
    "symbol": "АБ",
    "description": "Официальный сайт Абсолют Банка",
    "website": "https://www.absolutbank.ru/",
    "probe_url": "https://www.absolutbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "bcsbank",
    "name": "БКС Банк",
    "category": "finance",
    "symbol": "БК",
    "description": "Официальный сайт БКС Банка",
    "website": "https://bcs-bank.ru/",
    "probe_url": "https://bcs-bank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "mir",
    "name": "Платёжная система Мир",
    "category": "finance",
    "symbol": "МИ",
    "description": "Платёжная система Мир",
    "website": "https://mironline.ru/",
    "probe_url": "https://mironline.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "sbp",
    "name": "Система быстрых платежей",
    "category": "finance",
    "symbol": "СБП",
    "description": "Система быстрых платежей НСПК",
    "website": "https://sbp.nspk.ru/",
    "probe_url": "https://sbp.nspk.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "aws",
    "name": "Amazon Web Services",
    "category": "infrastructure",
    "symbol": "AWS",
    "description": "AWS — глобальная облачная платформа",
    "website": "https://aws.amazon.com/",
    "probe_url": "https://aws.amazon.com/",
    "status_api_url": null,
    "status_page_url": "https://health.aws.amazon.com/health/status"
  },
  {
    "id": "google_cloud",
    "name": "Google Cloud",
    "category": "infrastructure",
    "symbol": "GC",
    "description": "Google Cloud Platform",
    "website": "https://cloud.google.com/",
    "probe_url": "https://cloud.google.com/",
    "status_api_url": null,
    "status_page_url": "https://status.cloud.google.com/"
  },
  {
    "id": "azure",
    "name": "Microsoft Azure",
    "category": "infrastructure",
    "symbol": "AZ",
    "description": "Microsoft Azure Cloud",
    "website": "https://azure.microsoft.com/",
    "probe_url": "https://azure.microsoft.com/",
    "status_api_url": null,
    "status_page_url": "https://status.azure.com/"
  },
  {
    "id": "yandex_cloud",
    "name": "Yandex Cloud",
    "category": "infrastructure",
    "symbol": "YC",
    "description": "Облачная платформа Yandex Cloud",
    "website": "https://yandex.cloud/",
    "probe_url": "https://yandex.cloud/",
    "status_api_url": null,
    "status_page_url": "https://status.yandex.cloud/"
  },
  {
    "id": "vk_cloud",
    "name": "VK Cloud",
    "category": "infrastructure",
    "symbol": "VKC",
    "description": "Облачная платформа VK Cloud",
    "website": "https://cloud.vk.com/",
    "probe_url": "https://cloud.vk.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "cloud_ru",
    "name": "Cloud.ru",
    "category": "infrastructure",
    "symbol": "CR",
    "description": "Облачная платформа Cloud.ru",
    "website": "https://cloud.ru/",
    "probe_url": "https://cloud.ru/",
    "status_api_url": null,
    "status_page_url": "https://status.cloud.ru/"
  },
  {
    "id": "selectel",
    "name": "Selectel",
    "category": "infrastructure",
    "symbol": "SEL",
    "description": "Облако, VDS, сети, DNS и CDN Selectel",
    "website": "https://selectel.ru/",
    "probe_url": "https://selectel.ru/",
    "status_api_url": null,
    "status_page_url": "https://selectel.live/"
  },
  {
    "id": "mws",
    "name": "MWS / МТС Web Services",
    "category": "infrastructure",
    "symbol": "MWS",
    "description": "Облачная платформа МТС Web Services",
    "website": "https://mws.ru/",
    "probe_url": "https://mws.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "timeweb",
    "name": "Timeweb Cloud",
    "category": "infrastructure",
    "symbol": "TW",
    "description": "Облачная платформа Timeweb",
    "website": "https://timeweb.cloud/",
    "probe_url": "https://timeweb.cloud/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "reg_ru",
    "name": "REG.RU",
    "category": "infrastructure",
    "symbol": "REG",
    "description": "Хостинг, домены и облачные сервисы REG.RU",
    "website": "https://www.reg.ru/",
    "probe_url": "https://www.reg.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "beget",
    "name": "Beget",
    "category": "infrastructure",
    "symbol": "BE",
    "description": "Хостинг и облачные сервисы Beget",
    "website": "https://beget.com/",
    "probe_url": "https://beget.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "rostelecom_cloud",
    "name": "Ростелеком Cloud",
    "category": "infrastructure",
    "symbol": "РТК",
    "description": "Облачная платформа Ростелекома",
    "website": "https://cloud.rt.ru/",
    "probe_url": "https://cloud.rt.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "cdnvideo",
    "name": "CDNvideo",
    "category": "infrastructure",
    "symbol": "CDN",
    "description": "Российская CDN-платформа CDNvideo",
    "website": "https://www.cdnvideo.ru/",
    "probe_url": "https://www.cdnvideo.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "edgecenter",
    "name": "EdgeCenter",
    "category": "infrastructure",
    "symbol": "EC",
    "description": "CDN и cloud-инфраструктура EdgeCenter",
    "website": "https://edgecenter.ru/",
    "probe_url": "https://edgecenter.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "qrator",
    "name": "Qrator",
    "category": "infrastructure",
    "symbol": "QR",
    "description": "Сетевая инфраструктура и DDoS-защита Qrator",
    "website": "https://qrator.net/",
    "probe_url": "https://qrator.net/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "ngenix",
    "name": "NGENIX",
    "category": "infrastructure",
    "symbol": "NG",
    "description": "Российская CDN и edge-платформа NGENIX",
    "website": "https://ngenix.net/",
    "probe_url": "https://ngenix.net/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "mts",
    "name": "МТС",
    "category": "russian",
    "symbol": "МТС",
    "description": "Сайт оператора МТС",
    "website": "https://www.mts.ru/",
    "probe_url": "https://www.mts.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "megafon",
    "name": "МегаФон",
    "category": "russian",
    "symbol": "МФ",
    "description": "Сайт оператора МегаФон",
    "website": "https://megafon.ru/",
    "probe_url": "https://megafon.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "beeline",
    "name": "Билайн",
    "category": "russian",
    "symbol": "БЛ",
    "description": "Сайт оператора Билайн",
    "website": "https://beeline.ru/",
    "probe_url": "https://beeline.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "t2",
    "name": "Т2",
    "category": "russian",
    "symbol": "T2",
    "description": "Сайт оператора T2",
    "website": "https://t2.ru/",
    "probe_url": "https://t2.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "github_copilot",
    "name": "GitHub Copilot",
    "symbol": "GC",
    "category": "ai",
    "description": "GitHub Copilot — AI-функции GitHub",
    "website": "https://github.com/features/copilot",
    "probe_url": "https://github.com/",
    "status_api_url": "https://www.githubstatus.com/api/v2/summary.json",
    "status_page_url": "https://www.githubstatus.com/"
  },
  {
    "id": "aws_bedrock",
    "name": "Amazon Bedrock",
    "symbol": "AB",
    "category": "ai",
    "description": "Amazon Bedrock — модели и inference в AWS",
    "website": "https://aws.amazon.com/bedrock/",
    "probe_url": "https://aws.amazon.com/bedrock/",
    "status_api_url": null,
    "status_page_url": "https://health.aws.amazon.com/health/status"
  },
  {
    "id": "azure_openai",
    "name": "Azure OpenAI",
    "symbol": "AO",
    "category": "ai",
    "description": "Модели OpenAI в Azure AI Foundry",
    "website": "https://azure.microsoft.com/en-us/products/ai-foundry/",
    "probe_url": "https://azure.microsoft.com/en-us/products/ai-foundry/",
    "status_api_url": null,
    "status_page_url": "https://status.azure.com/"
  },
  {
    "id": "fireworks",
    "name": "Fireworks AI",
    "symbol": "FW",
    "category": "ai",
    "description": "Fireworks AI — inference API и модели",
    "website": "https://fireworks.ai/",
    "probe_url": "https://fireworks.ai/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "together",
    "name": "Together AI",
    "symbol": "TA",
    "category": "ai",
    "description": "Together AI — serverless inference и модели",
    "website": "https://www.together.ai/",
    "probe_url": "https://www.together.ai/",
    "status_api_url": null,
    "status_page_url": "https://status.together.ai/"
  },
  {
    "id": "midjourney",
    "name": "Midjourney",
    "symbol": "MJ",
    "category": "ai",
    "description": "Midjourney — генерация изображений",
    "website": "https://www.midjourney.com/",
    "probe_url": "https://www.midjourney.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "elevenlabs",
    "name": "ElevenLabs",
    "symbol": "EL",
    "category": "ai",
    "description": "ElevenLabs — синтез речи и voice AI",
    "website": "https://elevenlabs.io/",
    "probe_url": "https://elevenlabs.io/",
    "status_api_url": null,
    "status_page_url": "https://status.elevenlabs.io/"
  },
  {
    "id": "replicate",
    "name": "Replicate",
    "symbol": "RP",
    "category": "ai",
    "description": "Replicate — хостинг моделей и prediction API",
    "website": "https://replicate.com/",
    "probe_url": "https://replicate.com/",
    "status_api_url": null,
    "status_page_url": "https://www.replicatestatus.com/"
  },
  {
    "id": "runway",
    "name": "Runway",
    "symbol": "RW",
    "category": "ai",
    "description": "Runway — генерация видео и AI-инструменты",
    "website": "https://runwayml.com/",
    "probe_url": "https://runwayml.com/",
    "status_api_url": null,
    "status_page_url": "https://status.runway.team/"
  },
  {
    "id": "windsurf",
    "name": "Windsurf",
    "symbol": "WS",
    "category": "ai",
    "description": "Windsurf — AI IDE и Cascade",
    "website": "https://windsurf.com/",
    "probe_url": "https://windsurf.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "stability",
    "name": "Stability AI",
    "symbol": "SA",
    "category": "ai",
    "description": "Stability AI — генеративные модели",
    "website": "https://stability.ai/",
    "probe_url": "https://stability.ai/",
    "status_api_url": null,
    "status_page_url": "https://status.stability.ai/"
  },
  {
    "id": "luma",
    "name": "Luma AI",
    "symbol": "LA",
    "category": "ai",
    "description": "Luma AI — Dream Machine и генерация видео",
    "website": "https://lumalabs.ai/",
    "probe_url": "https://lumalabs.ai/",
    "status_api_url": null,
    "status_page_url": "https://status.lumalabs.ai/"
  },
  {
    "id": "ubrr",
    "name": "Банк УБРиР",
    "symbol": "УБ",
    "category": "finance",
    "description": "Уральский банк реконструкции и развития",
    "website": "https://www.ubrr.ru/",
    "probe_url": "https://www.ubrr.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "bank_rossiya",
    "name": "Банк Россия",
    "symbol": "БР",
    "category": "finance",
    "description": "Официальный сайт банка Россия",
    "website": "https://www.abr.ru/",
    "probe_url": "https://www.abr.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "unicredit",
    "name": "ЮниКредит Банк",
    "symbol": "ЮК",
    "category": "finance",
    "description": "Официальный сайт ЮниКредит Банка из реестра Банка России",
    "website": "https://www.unicreditbank.ru/",
    "probe_url": "https://www.unicreditbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "avers",
    "name": "Аверс Банк",
    "symbol": "АВ",
    "category": "finance",
    "description": "Официальный сайт банка Аверс",
    "website": "https://www.aversbank.ru/",
    "probe_url": "https://www.aversbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "chelindbank",
    "name": "Челиндбанк",
    "symbol": "ЧБ",
    "category": "finance",
    "description": "Официальный сайт Челиндбанка",
    "website": "https://chelind.ru/",
    "probe_url": "https://chelind.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "ozon_bank",
    "name": "ОЗОН Банк",
    "symbol": "ОЗ",
    "category": "finance",
    "description": "Официальный сайт ОЗОН Банка",
    "website": "https://finance.ozon.ru/",
    "probe_url": "https://finance.ozon.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "tochka",
    "name": "Банк Точка",
    "symbol": "ТО",
    "category": "finance",
    "description": "Официальный сайт банка Точка",
    "website": "https://tochka.com/",
    "probe_url": "https://tochka.com/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "msp_bank",
    "name": "МСП Банк",
    "symbol": "МСП",
    "category": "finance",
    "description": "Официальный сайт МСП Банка",
    "website": "https://mspbank.ru/",
    "probe_url": "https://mspbank.ru/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "openstreetmap",
    "name": "OpenStreetMap",
    "symbol": "OSM",
    "category": "mapping",
    "description": "OpenStreetMap — главная карта и веб-интерфейс",
    "website": "https://www.openstreetmap.org/",
    "probe_url": "https://www.openstreetmap.org/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "nominatim",
    "name": "Nominatim",
    "symbol": "NOM",
    "category": "mapping",
    "description": "Nominatim — поиск адресов и геокодирование OpenStreetMap",
    "website": "https://nominatim.openstreetmap.org/",
    "probe_url": "https://nominatim.openstreetmap.org/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "beacondb",
    "name": "BeaconDB",
    "symbol": "BDB",
    "category": "mapping",
    "description": "BeaconDB — открытая база Wi-Fi и геолокационных данных",
    "website": "https://beacondb.net/",
    "probe_url": "https://beacondb.net/",
    "status_api_url": null,
    "status_page_url": null
  },
  {
    "id": "roblox",
    "name": "Roblox",
    "symbol": "RBX",
    "category": "gaming",
    "description": "Roblox — сайт и игровая платформа",
    "website": "https://www.roblox.com/",
    "probe_url": "https://www.roblox.com/",
    "status_api_url": "https://status.roblox.com/api/v2/summary.json",
    "status_page_url": "https://status.roblox.com/"
  },
  {
    "id": "rockstar",
    "name": "Rockstar Games",
    "symbol": "RG",
    "category": "gaming",
    "description": "Rockstar Games — сайт, аккаунты и игровые сервисы",
    "website": "https://www.rockstargames.com/",
    "probe_url": "https://www.rockstargames.com/",
    "status_api_url": null,
    "status_page_url": "https://support.rockstargames.com/servicestatus"
  },
  {
    "id": "epic_games",
    "name": "Epic Games",
    "symbol": "EPIC",
    "category": "gaming",
    "description": "Epic Games — Epic Games Store, Epic Online Services и игровые сервисы",
    "website": "https://store.epicgames.com/",
    "probe_url": "https://store.epicgames.com/",
    "status_api_url": "https://status.epicgames.com/api/v2/summary.json",
    "status_page_url": "https://status.epicgames.com/"
  },
  {
    "id": "gitlab",
    "name": "GitLab",
    "symbol": "GL",
    "category": "development",
    "description": "GitLab.com — Git, CI/CD, Pages, Package Registry и Container Registry",
    "website": "https://gitlab.com/",
    "probe_url": "https://gitlab.com/users/sign_in",
    "status_api_url": null,
    "status_page_url": "https://status.gitlab.com/"
  },
  {
    "id": "npm_registry",
    "name": "npm Registry",
    "symbol": "NPM",
    "category": "development",
    "description": "npm Registry — получение и публикация JavaScript-пакетов",
    "website": "https://www.npmjs.com/",
    "probe_url": "https://registry.npmjs.org/-/ping",
    "status_api_url": "https://status.npmjs.org/api/v2/summary.json",
    "status_page_url": "https://status.npmjs.org/"
  },
  {
    "id": "pypi",
    "name": "PyPI",
    "symbol": "PY",
    "category": "development",
    "description": "PyPI — Python Package Index и загрузка Python-пакетов",
    "website": "https://pypi.org/",
    "probe_url": "https://pypi.org/simple/pip/",
    "status_api_url": "https://status.python.org/api/v2/summary.json",
    "status_page_url": "https://status.python.org/"
  },
  {
    "id": "adguard_dns",
    "name": "AdGuard DNS",
    "symbol": "ADG",
    "category": "infrastructure",
    "description": "AdGuard DNS — публичный DNS-резолвер, проверка через JSON DoH API",
    "website": "https://adguard-dns.io/",
    "probe_url": "https://dns.adguard-dns.com/resolve?name=www.example.com",
    "status_api_url": "https://status.adguard.com/api/v2/summary.json",
    "status_page_url": "https://status.adguard.com/"
  },
  {
    "id": "quad9_dns",
    "name": "Quad9 DNS",
    "symbol": "Q9",
    "category": "infrastructure",
    "description": "Quad9 DNS — официальная uptime-панель; проверяется доступность панели, не DNS-разрешение с runner",
    "website": "https://quad9.net/",
    "probe_url": "https://uptime.quad9.net/",
    "status_api_url": null,
    "status_page_url": "https://uptime.quad9.net/"
  },
  {
    "id": "ripe_ncc",
    "name": "RIPE NCC",
    "symbol": "RIPE",
    "category": "infrastructure",
    "description": "RIPE NCC — RIPEstat, RIPE Database, RPKI, RIPE Atlas и DNSMON",
    "website": "https://www.ripe.net/",
    "probe_url": "https://stat.ripe.net/",
    "status_api_url": "https://status.ripe.net/api/v2/summary.json",
    "status_page_url": "https://status.ripe.net/"
  },
  {
    "id": "digitalocean",
    "name": "DigitalOcean",
    "symbol": "DO",
    "category": "infrastructure",
    "description": "DigitalOcean — облачная платформа, API, App Platform и managed services",
    "website": "https://www.digitalocean.com/",
    "probe_url": "https://www.digitalocean.com/",
    "status_api_url": "https://status.digitalocean.com/api/v2/summary.json",
    "status_page_url": "https://status.digitalocean.com/"
  },
  {
    "id": "akamai",
    "name": "Akamai",
    "symbol": "AK",
    "category": "infrastructure",
    "description": "Akamai — CDN, Edge, DNS, security и cloud infrastructure",
    "website": "https://www.akamai.com/",
    "probe_url": "https://www.akamai.com/",
    "status_api_url": "https://www.akamaistatus.com/api/v2/summary.json",
    "status_page_url": "https://www.akamaistatus.com/"
  },
  {
    "id": "bunny",
    "name": "Bunny.net",
    "symbol": "BN",
    "category": "infrastructure",
    "description": "Bunny.net — CDN, DNS, Storage, Stream и edge services",
    "website": "https://bunny.net/",
    "probe_url": "https://bunny.net/",
    "status_api_url": null,
    "status_page_url": "https://status.bunny.net/"
  },
  {
    "id": "riot_games",
    "name": "Riot Games",
    "symbol": "RIOT",
    "category": "gaming",
    "description": "Riot Games — статус League of Legends, VALORANT и других игр (страница региона North America)",
    "website": "https://www.riotgames.com/",
    "probe_url": "https://status.riotgames.com/?locale=en-us",
    "status_api_url": null,
    "status_page_url": "https://status.riotgames.com/?locale=en-us"
  },
  {
    "id": "ea_servers",
    "name": "EA Servers",
    "symbol": "EA",
    "category": "gaming",
    "description": "EA Servers — EA app, EA Play, Apex Legends, Battlefield и EA SPORTS",
    "website": "https://www.ea.com/",
    "probe_url": "https://help.ea.com/en/server-status/",
    "status_api_url": null,
    "status_page_url": "https://help.ea.com/en/server-status/"
  },
  {
    "id": "playstation_network",
    "name": "PlayStation Network",
    "symbol": "PSN",
    "category": "gaming",
    "description": "PlayStation Network — официальная страница состояния сети PlayStation с выбором региона",
    "website": "https://www.playstation.com/",
    "probe_url": "https://status.playstation.com/corp/",
    "status_api_url": null,
    "status_page_url": "https://status.playstation.com/corp/"
  },
  {
    "id": "xbox_network",
    "name": "Xbox Network",
    "symbol": "XB",
    "category": "gaming",
    "description": "Xbox Network — Xbox Live, вход, профиль, multiplayer и сервисы Xbox",
    "website": "https://www.xbox.com/",
    "probe_url": "https://support.xbox.com/en-US/xbox-live-status",
    "status_api_url": null,
    "status_page_url": "https://support.xbox.com/en-US/xbox-live-status"
  },
  {
    "id": "overpass_api",
    "name": "Overpass API",
    "symbol": "OVP",
    "category": "mapping",
    "description": "Overpass API — выполнение минимального запроса к данным OpenStreetMap",
    "website": "https://wiki.openstreetmap.org/wiki/Overpass_API",
    "probe_url": "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3Bnode%281%29%3Bout%20count%3B",
    "status_api_url": null,
    "status_page_url": "https://wiki.openstreetmap.org/wiki/Overpass_API/status"
  }
];

const SERVICE_MAP = new Map(SERVICES.map(service => [service.id, service]));
const ALLOWED_RANGES = {
  "24h": {seconds: 86400, bucket: 300},
  "7d": {seconds: 604800, bucket: 900},
  "30d": {seconds: 2592000, bucket: 3600},
  "90d": {seconds: 7776000, bucket: 86400},
  "365d": {seconds: 31536000, bucket: 86400}
};

function json(data, status=200, extraHeaders={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

function cleanText(value, max=240) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0,max);
}

function healthFrom(probe, statusPage) {
  if (!probe.reachable) return "outage";
  const indicator = String(statusPage?.indicator || "").toLowerCase();
  if (indicator.includes("maintenance")) return "maintenance";
  if (indicator.includes("critical") || indicator.includes("major") || indicator.includes("outage")) return "outage";
  if (indicator.includes("minor") || indicator.includes("degraded")) return "degraded";
  if (probe.httpStatus >= 400) return "degraded";
  return "operational";
}

async function checkProbe(service) {
  const started = performance.now();
  try {
    const response = await fetch(service.probe_url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "accept": "text/html,application/json,text/plain,*/*",
        "cache-control": "no-cache",
        "user-agent": "MAKAKAIglitch-ServiceStatus/1.0 (+https://makakaiglitch.github.io/tools/service-status/)"
      },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
    });
    const latencyMs = Math.max(0, Math.round(performance.now() - started));
    const httpStatus = response.status;
    try { await response.body?.cancel(); } catch {}
    return {
      reachable: httpStatus < 500,
      latencyMs,
      httpStatus,
      errorCode: httpStatus >= 500 ? "HTTP_" + httpStatus : (httpStatus >= 400 ? "HTTP_" + httpStatus : null)
    };
  } catch (error) {
    const name = error?.name === "TimeoutError" || error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR";
    return {reachable:false,latencyMs:null,httpStatus:null,errorCode:name};
  }
}

async function checkStatusPage(service) {
  if (!service.status_api_url) return {available:false,indicator:null,summary:null};
  try {
    const response = await fetch(service.status_api_url, {
      method: "GET",
      redirect: "follow",
      headers: {"accept":"application/json","user-agent":"MAKAKAIglitch-ServiceStatus/1.0 (+https://makakaiglitch.github.io/tools/service-status/)"},
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS)
    });
    if (!response.ok) {
      try { await response.body?.cancel(); } catch {}
      return {available:false,indicator:null,summary:"Status API HTTP " + response.status};
    }
    const data = await response.json();
    const status = data?.status || {};
    return {
      available:true,
      indicator:cleanText(status.indicator,48).toLowerCase() || "unknown",
      summary:cleanText(status.description,240) || null
    };
  } catch {
    return {available:false,indicator:null,summary:null};
  }
}

async function checkService(service) {
  const probe = await checkProbe(service);
  const statusPage = await checkStatusPage(service);
  const health = healthFrom(probe,statusPage);
  const up = probe.reachable && health !== "outage";
  return {
    service,
    checkedAt:Math.floor(Date.now()/1000),
    latencyMs:probe.latencyMs,
    httpStatus:probe.httpStatus,
    reachable:probe.reachable,
    up,
    errorCode:probe.errorCode,
    health,
    statusIndicator:statusPage.indicator,
    statusSummary:statusPage.summary,
    statusApiAvailable:statusPage.available
  };
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({length:Math.min(limit,items.length)},async()=>{
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

async function runScheduledChecks(env, scheduledTime, servicesToCheck=SERVICES) {
  if (!env.DB) throw new Error("Missing D1 binding: DB");
  const checkedAt = Math.floor((scheduledTime || Date.now())/1000);
  const stateResult = await env.DB.prepare(
    "SELECT service_id, consecutive_bad, consecutive_good, current_incident_id FROM service_state"
  ).all();
  const oldStates = new Map((stateResult.results || []).map(row=>[row.service_id,row]));
  const results = await mapLimit(servicesToCheck,MAX_CONCURRENT_SERVICES,checkService);

  const probeRows = [];
  const stateRows = [];
  const incidentsToOpen = [];
  const incidentsToClose = [];

  for (const result of results) {
    const serviceId = result.service.id;
    const previous = oldStates.get(serviceId) || {};
    const previousBad = Number(previous.consecutive_bad || 0);
    const previousGood = Number(previous.consecutive_good || 0);
    let incidentId = previous.current_incident_id || null;
    const isBad = result.health !== "operational";
    const nextBad = isBad ? previousBad + 1 : 0;
    const nextGood = isBad ? 0 : previousGood + 1;

    if (isBad && nextBad >= 2 && !incidentId) {
      incidentId = crypto.randomUUID();
      const severity = result.health === "outage" ? "major" : (result.health === "maintenance" ? "maintenance" : "minor");
      const message = result.errorCode
        ? "Проверочный endpoint не ответил: " + result.errorCode
        : (result.statusSummary || (result.health === "maintenance" ? "Официальная status page сообщает о технических работах." : "Состояние сервиса отличается от нормального."));
      incidentsToOpen.push([
        incidentId,serviceId,checkedAt,severity,cleanText(message,400),
        result.statusApiAvailable ? "probe+status_api" : "http_probe"
      ]);
    } else if (!isBad && incidentId && nextGood >= 2) {
      incidentsToClose.push(incidentId);
      incidentId = null;
    }

    probeRows.push([
      serviceId,checkedAt,result.latencyMs,result.up ? 1 : 0,result.httpStatus,
      result.errorCode,result.health,result.statusIndicator,result.statusSummary,
      result.statusApiAvailable ? 1 : 0
    ]);
    stateRows.push([serviceId,nextBad,nextGood,incidentId,result.health,checkedAt]);
  }

  const statements = [];
  // D1 allows at most 100 bound parameters per statement. Keep each
  // multi-row probe insert at 8 rows (80 parameters).
  for (let offset=0; offset<probeRows.length; offset+=8) {
    const chunk=probeRows.slice(offset,offset+8);
    const values=chunk.map(()=>"(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    statements.push(env.DB.prepare(
      "INSERT INTO probe_results (service_id, checked_at, latency_ms, up, http_status, error_code, health_status, status_indicator, status_summary, status_api_available) VALUES " + values
    ).bind(...chunk.flat()));
  }

  // Six parameters per row: batches of 16 stay below D1's 100-variable limit.
  for (let offset=0; offset<stateRows.length; offset+=16) {
    const chunk=stateRows.slice(offset,offset+16);
    const values=chunk.map(()=>"(?, ?, ?, ?, ?, ?)").join(", ");
    statements.push(env.DB.prepare(
      "INSERT INTO service_state (service_id, consecutive_bad, consecutive_good, current_incident_id, last_status, updated_at) VALUES " + values +
      " ON CONFLICT(service_id) DO UPDATE SET consecutive_bad=excluded.consecutive_bad, consecutive_good=excluded.consecutive_good, current_incident_id=excluded.current_incident_id, last_status=excluded.last_status, updated_at=excluded.updated_at"
    ).bind(...chunk.flat()));
  }

  // Incident rows have 6 bound values (ended_at is SQL NULL). Limit each
  // insert to 14 rows to stay below D1's 100-parameter statement ceiling.
  for (let offset=0; offset<incidentsToOpen.length; offset+=14) {
    const chunk=incidentsToOpen.slice(offset,offset+14);
    const values=chunk.map(()=>"(?, ?, ?, NULL, ?, ?, ?)").join(", ");
    statements.push(env.DB.prepare(
      "INSERT INTO incidents (id, service_id, started_at, ended_at, severity, message, source) VALUES " + values
    ).bind(...chunk.flat()));
  }

  if (incidentsToClose.length) {
    const placeholders=incidentsToClose.map(()=>"?").join(", ");
    statements.push(env.DB.prepare(
      "UPDATE incidents SET ended_at = ? WHERE ended_at IS NULL AND id IN (" + placeholders + ")"
    ).bind(checkedAt,...incidentsToClose));
  }

  if (statements.length) await env.DB.batch(statements);

  console.log(JSON.stringify({
    event:"service_status_checks_complete",
    checked_at:checkedAt,
    services:results.length,
    available:results.filter(item=>item.up).length,
    incidents_opened:incidentsToOpen.length,
    incidents_closed:incidentsToClose.length,
    d1_statements:statements.length
  }));
}
async function compactAndCleanup(env, nowSeconds=Math.floor(Date.now()/1000)) {
  if (!env.DB) throw new Error("Missing D1 binding: DB");
  const rawCutoff = Math.floor((nowSeconds - DETAILED_RETENTION_DAYS*86400)/86400)*86400;
  const retentionCutoff = nowSeconds - RETENTION_DAYS*86400;
  const dailyRetentionCutoff = Math.floor(retentionCutoff/86400)*86400;
  const result = await env.DB.batch([
    env.DB.prepare(
      "INSERT OR REPLACE INTO probe_daily (service_id, day_start, checks, successful, latency_sum, latency_samples, min_latency_ms, max_latency_ms) " +
      "SELECT service_id, (checked_at / 86400) * 86400 AS day_start, COUNT(*), SUM(up), " +
      "COALESCE(SUM(latency_ms), 0), COUNT(latency_ms), MIN(latency_ms), MAX(latency_ms) " +
      "FROM probe_results WHERE checked_at >= ? AND checked_at < ? GROUP BY service_id, day_start"
    ).bind(retentionCutoff,rawCutoff),
    env.DB.prepare("DELETE FROM probe_results WHERE checked_at < ? AND checked_at >= ?").bind(rawCutoff,retentionCutoff),
    env.DB.prepare("DELETE FROM probe_results WHERE checked_at < ?").bind(retentionCutoff),
    env.DB.prepare("DELETE FROM probe_daily WHERE day_start < ?").bind(dailyRetentionCutoff),
    env.DB.prepare("DELETE FROM incidents WHERE ended_at IS NOT NULL AND ended_at < ?").bind(retentionCutoff)
  ]);
  console.log(JSON.stringify({
    event:"service_status_retention_compaction",
    raw_cutoff:rawCutoff,
    retention_cutoff:retentionCutoff,
    statements:result.length
  }));
}

async function getHealth(env) {
  const row = await env.DB.prepare("SELECT MAX(checked_at) AS last_check_at FROM probe_results").first();
  return {
    ok:true,
    service_count:SERVICES.length,
    interval_minutes:CHECK_INTERVAL_SECONDS/60,
    retention_days:RETENTION_DAYS,
    detailed_retention_days:DETAILED_RETENTION_DAYS,
    history_granularity:{recent_seconds:CHECK_INTERVAL_SECONDS,daily_after_days:DETAILED_RETENTION_DAYS},
    last_check_at:row?.last_check_at ?? null,
    monitoring_location:"Cloudflare Worker execution region; single vantage point",
    uptime_definition:"HTTP endpoint reachable (status < 500), excluding official major-outage state"
  };
}

async function getServices(env) {
  const [latestResult,uptimeResult,incidentResult] = await Promise.all([
    env.DB.prepare(
      "SELECT p.* FROM probe_results p JOIN (SELECT service_id, MAX(checked_at) AS latest_at FROM probe_results GROUP BY service_id) latest ON latest.service_id=p.service_id AND latest.latest_at=p.checked_at"
    ).all(),
    env.DB.prepare(
      "SELECT service_id, COUNT(*) AS checks_24h, ROUND(100.0 * SUM(up) / COUNT(*), 3) AS uptime_24h FROM probe_results WHERE checked_at >= ? GROUP BY service_id"
    ).bind(Math.floor(Date.now()/1000)-86400).all(),
    env.DB.prepare(
      "SELECT service_id, COUNT(*) AS active_incidents FROM incidents WHERE ended_at IS NULL GROUP BY service_id"
    ).all()
  ]);
  const latest = new Map((latestResult.results || []).map(row=>[row.service_id,row]));
  const uptime = new Map((uptimeResult.results || []).map(row=>[row.service_id,row]));
  const incidents = new Map((incidentResult.results || []).map(row=>[row.service_id,Number(row.active_incidents)]));
  return {
    services:SERVICES.map(service=>{
      const row=latest.get(service.id) || null;
      const stats=uptime.get(service.id) || null;
      return {
        id:service.id,name:service.name,category:service.category,symbol:service.symbol,
        description:service.description,website:service.website,status_page_url:service.status_page_url,
        status:row?.health_status || "unknown",
        latest:row ? {
          checked_at:row.checked_at,latency_ms:row.latency_ms,http_status:row.http_status,
          up:Boolean(row.up),error_code:row.error_code,health_status:row.health_status,
          status_indicator:row.status_indicator,status_summary:row.status_summary,
          status_api_available:Boolean(row.status_api_available)
        } : null,
        uptime_24h:stats ? Number(stats.uptime_24h) : null,
        checks_24h:stats ? Number(stats.checks_24h) : 0,
        active_incidents:incidents.get(service.id) || 0
      };
    })
  };
}

async function getHistory(env, url) {
  const serviceId=url.searchParams.get("service") || "";
  const rangeKey=url.searchParams.get("range") || "24h";
  const service=SERVICE_MAP.get(serviceId);
  const range=ALLOWED_RANGES[rangeKey];
  if (!service) return json({error:"Unknown service id."},400);
  if (!range) return json({error:"Unsupported range. Use 24h, 7d, 30d, 90d or 365d."},400);
  const to=Math.floor(Date.now()/1000);
  const exactFrom=to-range.seconds;
  const from=(rangeKey==="90d" || rangeKey==="365d")
    ? Math.ceil(exactFrom/86400)*86400
    : exactFrom;
  let query;
  if (rangeKey === "90d" || rangeKey === "365d") {
    // Older than 30 days is kept as one daily rollup per service. The most
    // recent 30 days remain at five-minute resolution and are grouped daily
    // only for long-range charts.
    const rawFrom = Math.floor((to-DETAILED_RETENTION_DAYS*86400)/86400)*86400;
    const dailyFrom = Math.floor(from/86400)*86400;
    query = await env.DB.prepare(
      "SELECT bucket_at, SUM(checks) AS checks, SUM(successful) AS successful, " +
      "SUM(failed) AS failed, " +
      "CASE WHEN SUM(latency_samples)>0 THEN SUM(latency_sum)/SUM(latency_samples) ELSE NULL END AS avg_latency_ms, " +
      "MIN(min_latency_ms) AS min_latency_ms, MAX(max_latency_ms) AS max_latency_ms, " +
      "SUM(latency_samples) AS latency_samples FROM (" +
      "SELECT day_start AS bucket_at, checks, successful, checks-successful AS failed, latency_sum, latency_samples, min_latency_ms, max_latency_ms " +
      "FROM probe_daily WHERE service_id = ? AND day_start >= ? AND day_start < ? " +
      "UNION ALL " +
      "SELECT (checked_at / 86400)*86400 AS bucket_at, COUNT(*) AS checks, SUM(up) AS successful, " +
      "COUNT(*)-SUM(up) AS failed, COALESCE(SUM(latency_ms),0) AS latency_sum, COUNT(latency_ms) AS latency_samples, " +
      "MIN(latency_ms) AS min_latency_ms, MAX(latency_ms) AS max_latency_ms " +
      "FROM probe_results WHERE service_id = ? AND checked_at >= ? GROUP BY bucket_at" +
      ") GROUP BY bucket_at ORDER BY bucket_at ASC"
    ).bind(serviceId,dailyFrom,rawFrom,serviceId,rawFrom).all();
  } else {
    query = await env.DB.prepare(
      "SELECT (checked_at / ?) * ? AS bucket_at, COUNT(*) AS checks, SUM(up) AS successful, COUNT(*) - SUM(up) AS failed, AVG(latency_ms) AS avg_latency_ms, MIN(latency_ms) AS min_latency_ms, MAX(latency_ms) AS max_latency_ms, COUNT(latency_ms) AS latency_samples FROM probe_results WHERE service_id = ? AND checked_at >= ? GROUP BY bucket_at ORDER BY bucket_at ASC"
    ).bind(range.bucket,range.bucket,serviceId,from).all();
  }
  const rows=query.results || [];
  const checks=rows.reduce((sum,row)=>sum+Number(row.checks||0),0);
  const successful=rows.reduce((sum,row)=>sum+Number(row.successful||0),0);
  const failed=checks-successful;
  const weightedLatency=rows.reduce((sum,row)=>sum+(Number(row.avg_latency_ms||0)*Number(row.latency_samples||0)),0);
  const totalLatencySamples=rows.reduce((sum,row)=>sum+Number(row.latency_samples||0),0);
  const expected=Math.max(1,Math.ceil((to-from)/CHECK_INTERVAL_SECONDS));
  const coveragePct=Math.min(100,checks/expected*100);
  return json({
    service_id:serviceId,range:rangeKey,bucket_seconds:range.bucket,from,to,
    checks,successful,failed,
    uptime_pct:checks ? Number((successful/checks*100).toFixed(4)) : null,
    coverage_pct:Number(coveragePct.toFixed(2)),
    avg_latency_ms:totalLatencySamples ? Number((weightedLatency/totalLatencySamples).toFixed(2)) : null,
    points:rows.map(row=>{
      const pointChecks=Number(row.checks||0);
      const pointOk=Number(row.successful||0);
      return {
        timestamp:Number(row.bucket_at),checks:pointChecks,successful:pointOk,failed:Number(row.failed||0),
        uptime_pct:pointChecks ? Number((pointOk/pointChecks*100).toFixed(2)) : null,
        avg_latency_ms:row.avg_latency_ms===null ? null : Number(Number(row.avg_latency_ms).toFixed(2)),
        latency_samples:Number(row.latency_samples||0),
        min_latency_ms:row.min_latency_ms===null ? null : Number(row.min_latency_ms),
        max_latency_ms:row.max_latency_ms===null ? null : Number(row.max_latency_ms)
      };
    })
  });
}

async function getIncidents(env, url) {
  const requested=Number(url.searchParams.get("days") || 30);
  const days=[7,30,90,365].includes(requested) ? requested : 30;
  const from=Math.floor(Date.now()/1000)-days*86400;
  const query=await env.DB.prepare(
    "SELECT id,service_id,started_at,ended_at,severity,message,source FROM incidents WHERE started_at >= ? ORDER BY started_at DESC LIMIT 250"
  ).bind(from).all();
  return json({days,incidents:query.results || []});
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if (request.method==="OPTIONS") {
      return new Response(null,{status:204,headers:{
        "access-control-allow-origin":"*",
        "access-control-allow-methods":"GET, OPTIONS",
        "access-control-allow-headers":"Content-Type",
        "access-control-max-age":"86400"
      }});
    }
    if (request.method!=="GET") return json({error:"Method not allowed."},405,{"allow":"GET, OPTIONS"});
    if (!url.pathname.startsWith("/api/")) return json({name:"Service Status Monitor API",version:1,endpoints:["/api/health","/api/services","/api/history?service=telegram&range=24h","/api/incidents?days=30"]});
    if (!env.DB) return json({error:"D1 binding DB is not configured."},503);
    try {
      if (url.pathname==="/api/health") return json(await getHealth(env));
      if (url.pathname==="/api/services") return json(await getServices(env));
      if (url.pathname==="/api/history") return await getHistory(env,url);
      if (url.pathname==="/api/incidents") return await getIncidents(env,url);
      return json({error:"Endpoint not found."},404);
    } catch (error) {
      console.error("API request failed:",error?.stack || error);
      return json({error:"Database or API error. Check Worker logs and D1 binding."},503);
    }
  },

  async scheduled(controller, env) {
    try {
      const scheduleTime = controller.scheduledTime || Date.now();
      if (controller.cron === "57 3 * * *") {
        await compactAndCleanup(env,Math.floor(scheduleTime/1000));
      } else {
        const group = controller.cron === "1-59/5 * * * *" ? 1 :
          controller.cron === "2-59/5 * * * *" ? 2 :
          controller.cron === "3-59/5 * * * *" ? 3 : 0;
        const batch = SERVICES.filter((service,index)=>index%4===group);
        await runScheduledChecks(env,scheduleTime,batch);
      }
    } catch (error) {
      console.error("Scheduled monitor run failed:",error?.stack || error);
      throw error;
    }
  }
};
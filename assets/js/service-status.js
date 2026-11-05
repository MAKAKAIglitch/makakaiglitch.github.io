(() => {
"use strict";

const CATALOG = [
  {
    "id": "telegram",
    "name": "Telegram",
    "symbol": "TG",
    "category": "communication",
    "description": "Telegram Web — доступность веб-клиента",
    "website": "https://web.telegram.org/",
    "status_page_url": null
  },
  {
    "id": "youtube",
    "name": "YouTube",
    "symbol": "YT",
    "category": "media",
    "description": "YouTube — веб-сайт и видеоплатформа",
    "website": "https://www.youtube.com/",
    "status_page_url": null
  },
  {
    "id": "google",
    "name": "Google Search",
    "symbol": "G",
    "category": "search",
    "description": "Поисковая система Google",
    "website": "https://www.google.com/",
    "status_page_url": null
  },
  {
    "id": "cloudflare",
    "name": "Cloudflare",
    "symbol": "CF",
    "category": "infrastructure",
    "description": "Cloudflare — edge, DNS и CDN",
    "website": "https://www.cloudflare.com/cdn-cgi/trace",
    "status_page_url": "https://www.cloudflarestatus.com/"
  },
  {
    "id": "github",
    "name": "GitHub",
    "symbol": "GH",
    "category": "development",
    "description": "GitHub — сайт, API и репозитории",
    "website": "https://github.com/",
    "status_page_url": "https://www.githubstatus.com/"
  },
  {
    "id": "discord",
    "name": "Discord",
    "symbol": "DC",
    "category": "communication",
    "description": "Discord — веб-клиент и Gateway",
    "website": "https://discord.com/",
    "status_page_url": "https://discordstatus.com/"
  },
  {
    "id": "openai",
    "name": "OpenAI / ChatGPT",
    "symbol": "AI",
    "category": "ai",
    "description": "ChatGPT и платформа OpenAI",
    "website": "https://chatgpt.com/",
    "status_page_url": "https://status.openai.com/"
  },
  {
    "id": "steam",
    "name": "Steam Store",
    "symbol": "ST",
    "category": "media",
    "description": "Steam Store — магазин Steam",
    "website": "https://store.steampowered.com/",
    "status_page_url": null
  },
  {
    "id": "nextdns",
    "name": "NextDNS",
    "symbol": "ND",
    "category": "infrastructure",
    "description": "NextDNS — тестовый endpoint",
    "website": "https://nextdns.io/",
    "status_page_url": null
  },
  {
    "id": "reddit",
    "name": "Reddit",
    "symbol": "R",
    "category": "media",
    "description": "Reddit — веб-платформа",
    "website": "https://www.reddit.com/",
    "status_page_url": null
  },
  {
    "id": "x",
    "name": "X",
    "symbol": "X",
    "category": "communication",
    "description": "X — социальная платформа",
    "website": "https://x.com/",
    "status_page_url": null
  },
  {
    "id": "twitch",
    "name": "Twitch",
    "symbol": "TW",
    "category": "media",
    "description": "Twitch — стриминговая платформа",
    "website": "https://www.twitch.tv/",
    "status_page_url": null
  },
  {
    "id": "spotify",
    "name": "Spotify",
    "symbol": "SP",
    "category": "media",
    "description": "Spotify Web Player",
    "website": "https://open.spotify.com/",
    "status_page_url": null
  },
  {
    "id": "wikipedia",
    "name": "Wikipedia",
    "symbol": "W",
    "category": "platform",
    "description": "Wikipedia — онлайн-энциклопедия",
    "website": "https://www.wikipedia.org/",
    "status_page_url": null
  },
  {
    "id": "whatsapp",
    "name": "WhatsApp",
    "symbol": "WA",
    "category": "communication",
    "description": "WhatsApp Web",
    "website": "https://web.whatsapp.com/",
    "status_page_url": null
  },
  {
    "id": "microsoft",
    "name": "Microsoft",
    "symbol": "MS",
    "category": "platform",
    "description": "Сайт Microsoft",
    "website": "https://www.microsoft.com/",
    "status_page_url": null
  },
  {
    "id": "steam_community",
    "name": "Steam Community",
    "symbol": "SC",
    "category": "media",
    "description": "Сообщество Steam, профили и обсуждения",
    "website": "https://steamcommunity.com/",
    "status_page_url": null
  },
  {
    "id": "steam_api",
    "name": "Steam Web API",
    "symbol": "SA",
    "category": "development",
    "description": "Публичный endpoint Steam Web API",
    "website": "https://steamcommunity.com/dev",
    "status_page_url": null
  },
  {
    "id": "yandex_search",
    "name": "Яндекс Поиск",
    "symbol": "Я",
    "category": "search",
    "description": "Поисковая система Яндекса",
    "website": "https://yandex.ru/",
    "status_page_url": null
  },
  {
    "id": "bing",
    "name": "Bing",
    "symbol": "BI",
    "category": "search",
    "description": "Поисковая система Microsoft Bing",
    "website": "https://www.bing.com/",
    "status_page_url": null
  },
  {
    "id": "duckduckgo",
    "name": "DuckDuckGo",
    "symbol": "DD",
    "category": "search",
    "description": "Поисковая система DuckDuckGo",
    "website": "https://duckduckgo.com/",
    "status_page_url": null
  },
  {
    "id": "anthropic",
    "name": "Anthropic / Claude",
    "symbol": "CL",
    "category": "ai",
    "description": "Claude, Claude Code и Anthropic API",
    "website": "https://claude.ai/",
    "status_page_url": "https://status.claude.com/"
  },
  {
    "id": "gemini",
    "name": "Google Gemini",
    "symbol": "GE",
    "category": "ai",
    "description": "Gemini и веб-приложение Google AI",
    "website": "https://gemini.google.com/",
    "status_page_url": null
  },
  {
    "id": "xai",
    "name": "xAI / Grok",
    "symbol": "GX",
    "category": "ai",
    "description": "Grok и xAI API",
    "website": "https://grok.com/",
    "status_page_url": "https://status.x.ai/"
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "symbol": "PE",
    "category": "ai",
    "description": "Поиск с ИИ и Perplexity API",
    "website": "https://www.perplexity.ai/",
    "status_page_url": "https://status.perplexity.com/"
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "symbol": "DS",
    "category": "ai",
    "description": "DeepSeek Chat и API",
    "website": "https://chat.deepseek.com/",
    "status_page_url": "https://status.deepseek.com/"
  },
  {
    "id": "mistral",
    "name": "Mistral AI / Le Chat",
    "symbol": "MI",
    "category": "ai",
    "description": "Le Chat и Mistral API",
    "website": "https://chat.mistral.ai/",
    "status_page_url": "https://status.mistral.ai/"
  },
  {
    "id": "cohere",
    "name": "Cohere",
    "symbol": "CO",
    "category": "ai",
    "description": "Cohere API и модели",
    "website": "https://cohere.com/",
    "status_page_url": "https://status.cohere.com/"
  },
  {
    "id": "groq",
    "name": "Groq",
    "symbol": "GR",
    "category": "ai",
    "description": "GroqCloud и inference API",
    "website": "https://groq.com/",
    "status_page_url": null
  },
  {
    "id": "huggingface",
    "name": "Hugging Face",
    "symbol": "HF",
    "category": "ai",
    "description": "Hugging Face Hub и Inference",
    "website": "https://huggingface.co/",
    "status_page_url": "https://status.huggingface.co/"
  },
  {
    "id": "openrouter",
    "name": "OpenRouter",
    "symbol": "OR",
    "category": "ai",
    "description": "Единый API-роутер языковых моделей",
    "website": "https://openrouter.ai/",
    "status_page_url": "https://status.openrouter.ai/"
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "symbol": "CU",
    "category": "ai",
    "description": "AI-редактор Cursor и его сервисы",
    "website": "https://cursor.com/",
    "status_page_url": null
  },
  {
    "id": "gigachat",
    "name": "Сбер / GigaChat",
    "symbol": "GI",
    "category": "ai",
    "description": "GigaChat — ИИ-сервис Сбера",
    "website": "https://giga.chat/",
    "status_page_url": null
  },
  {
    "id": "yandex_ai",
    "name": "Яндекс Алиса / AI",
    "symbol": "YA",
    "category": "ai",
    "description": "Алиса и ИИ-сервисы Яндекса",
    "website": "https://alice.yandex.ru/",
    "status_page_url": null
  },
  {
    "id": "yandex",
    "name": "Яндекс",
    "symbol": "Я",
    "category": "russian",
    "description": "Портал и основные сервисы Яндекса",
    "website": "https://ya.ru/",
    "status_page_url": null
  },
  {
    "id": "yandex_disk",
    "name": "Яндекс Диск",
    "symbol": "YD",
    "category": "russian",
    "description": "Облачное хранилище Яндекс Диск",
    "website": "https://disk.yandex.ru/",
    "status_page_url": null
  },
  {
    "id": "vk",
    "name": "ВКонтакте",
    "symbol": "VK",
    "category": "russian",
    "description": "Социальная сеть ВКонтакте",
    "website": "https://vk.com/",
    "status_page_url": null
  },
  {
    "id": "mail_ru",
    "name": "Почта Mail.ru",
    "symbol": "MR",
    "category": "russian",
    "description": "Почта Mail.ru",
    "website": "https://mail.ru/",
    "status_page_url": null
  },
  {
    "id": "dzen",
    "name": "Дзен",
    "symbol": "DZ",
    "category": "russian",
    "description": "Платформа Дзен",
    "website": "https://dzen.ru/",
    "status_page_url": null
  },
  {
    "id": "rutube",
    "name": "RuTube",
    "symbol": "RT",
    "category": "russian",
    "description": "Российский видеохостинг RuTube",
    "website": "https://rutube.ru/",
    "status_page_url": null
  },
  {
    "id": "odnoklassniki",
    "name": "Одноклассники",
    "symbol": "OK",
    "category": "russian",
    "description": "Социальная сеть Одноклассники",
    "website": "https://ok.ru/",
    "status_page_url": null
  },
  {
    "id": "gosuslugi",
    "name": "Госуслуги",
    "symbol": "ГУ",
    "category": "russian",
    "description": "Портал государственных услуг",
    "website": "https://www.gosuslugi.ru/",
    "status_page_url": null
  },
  {
    "id": "sber",
    "name": "Сбербанк",
    "symbol": "СБ",
    "category": "finance",
    "description": "Официальный сайт Сбербанка; проверяется веб-доступность",
    "website": "https://www.sberbank.ru/",
    "status_page_url": null
  },
  {
    "id": "vtb",
    "name": "ВТБ",
    "symbol": "ВТ",
    "category": "finance",
    "description": "Официальный сайт банка ВТБ",
    "website": "https://www.vtb.ru/",
    "status_page_url": null
  },
  {
    "id": "tbank",
    "name": "Т-Банк",
    "symbol": "ТБ",
    "category": "finance",
    "description": "Официальный сайт Т-Банка",
    "website": "https://www.tbank.ru/",
    "status_page_url": null
  },
  {
    "id": "alfa",
    "name": "Альфа-Банк",
    "symbol": "АБ",
    "category": "finance",
    "description": "Официальный сайт Альфа-Банка",
    "website": "https://alfabank.ru/",
    "status_page_url": null
  },
  {
    "id": "gazprombank",
    "name": "Газпромбанк",
    "symbol": "ГП",
    "category": "finance",
    "description": "Официальный сайт Газпромбанка",
    "website": "https://www.gazprombank.ru/",
    "status_page_url": null
  },
  {
    "id": "sovcombank",
    "name": "Совкомбанк",
    "symbol": "СК",
    "category": "finance",
    "description": "Официальный сайт Совкомбанка",
    "website": "https://sovcombank.ru/",
    "status_page_url": null
  },
  {
    "id": "psb",
    "name": "ПСБ",
    "symbol": "ПС",
    "category": "finance",
    "description": "Официальный сайт банка ПСБ",
    "website": "https://www.psbank.ru/",
    "status_page_url": null
  },
  {
    "id": "rshb",
    "name": "Россельхозбанк",
    "symbol": "РС",
    "category": "finance",
    "description": "Официальный сайт Россельхозбанка",
    "website": "https://www.rshb.ru/",
    "status_page_url": null
  },
  {
    "id": "mkb",
    "name": "Московский кредитный банк",
    "symbol": "МК",
    "category": "finance",
    "description": "Официальный сайт МКБ",
    "website": "https://mkb.ru/",
    "status_page_url": null
  },
  {
    "id": "mts_bank",
    "name": "МТС Банк",
    "symbol": "МБ",
    "category": "finance",
    "description": "Официальный сайт МТС Банка",
    "website": "https://www.mtsbank.ru/",
    "status_page_url": null
  },
  {
    "id": "domrf_bank",
    "name": "Банк ДОМ.РФ",
    "symbol": "ДР",
    "category": "finance",
    "description": "Официальный сайт Банка ДОМ.РФ",
    "website": "https://domrfbank.ru/",
    "status_page_url": null
  },
  {
    "id": "zenit_bank",
    "name": "Банк ЗЕНИТ",
    "symbol": "ЗН",
    "category": "finance",
    "description": "Официальный сайт банка ЗЕНИТ",
    "website": "https://www.zenit.ru/",
    "status_page_url": null
  },
  {
    "id": "akbars",
    "name": "Ак Барс Банк",
    "symbol": "АК",
    "category": "finance",
    "description": "Официальный сайт Ак Барс Банка",
    "website": "https://www.akbars.ru/",
    "status_page_url": null
  },
  {
    "id": "bspb",
    "name": "Банк Санкт-Петербург",
    "symbol": "БС",
    "category": "finance",
    "description": "Официальный сайт Банка Санкт-Петербург",
    "website": "https://www.bspb.ru/",
    "status_page_url": null
  },
  {
    "id": "uralsib",
    "name": "Банк Уралсиб",
    "symbol": "УР",
    "category": "finance",
    "description": "Официальный сайт Банка Уралсиб",
    "website": "https://www.uralsib.ru/",
    "status_page_url": null
  },
  {
    "id": "modulbank",
    "name": "Модульбанк",
    "symbol": "МД",
    "category": "finance",
    "description": "Официальный сайт Модульбанка",
    "website": "https://modulbank.ru/",
    "status_page_url": null
  },
  {
    "id": "absolutbank",
    "name": "Абсолют Банк",
    "symbol": "АБ",
    "category": "finance",
    "description": "Официальный сайт Абсолют Банка",
    "website": "https://www.absolutbank.ru/",
    "status_page_url": null
  },
  {
    "id": "bcsbank",
    "name": "БКС Банк",
    "symbol": "БК",
    "category": "finance",
    "description": "Официальный сайт БКС Банка",
    "website": "https://bcs-bank.ru/",
    "status_page_url": null
  },
  {
    "id": "mir",
    "name": "Платёжная система Мир",
    "symbol": "МИ",
    "category": "finance",
    "description": "Платёжная система Мир",
    "website": "https://mironline.ru/",
    "status_page_url": null
  },
  {
    "id": "sbp",
    "name": "Система быстрых платежей",
    "symbol": "СБП",
    "category": "finance",
    "description": "Система быстрых платежей НСПК",
    "website": "https://sbp.nspk.ru/",
    "status_page_url": null
  },
  {
    "id": "aws",
    "name": "Amazon Web Services",
    "symbol": "AWS",
    "category": "infrastructure",
    "description": "AWS — глобальная облачная платформа",
    "website": "https://aws.amazon.com/",
    "status_page_url": "https://health.aws.amazon.com/health/status"
  },
  {
    "id": "google_cloud",
    "name": "Google Cloud",
    "symbol": "GC",
    "category": "infrastructure",
    "description": "Google Cloud Platform",
    "website": "https://cloud.google.com/",
    "status_page_url": "https://status.cloud.google.com/"
  },
  {
    "id": "azure",
    "name": "Microsoft Azure",
    "symbol": "AZ",
    "category": "infrastructure",
    "description": "Microsoft Azure Cloud",
    "website": "https://azure.microsoft.com/",
    "status_page_url": "https://status.azure.com/"
  },
  {
    "id": "yandex_cloud",
    "name": "Yandex Cloud",
    "symbol": "YC",
    "category": "infrastructure",
    "description": "Облачная платформа Yandex Cloud",
    "website": "https://yandex.cloud/",
    "status_page_url": "https://status.yandex.cloud/"
  },
  {
    "id": "vk_cloud",
    "name": "VK Cloud",
    "symbol": "VKC",
    "category": "infrastructure",
    "description": "Облачная платформа VK Cloud",
    "website": "https://cloud.vk.com/",
    "status_page_url": null
  },
  {
    "id": "cloud_ru",
    "name": "Cloud.ru",
    "symbol": "CR",
    "category": "infrastructure",
    "description": "Облачная платформа Cloud.ru",
    "website": "https://cloud.ru/",
    "status_page_url": "https://status.cloud.ru/"
  },
  {
    "id": "selectel",
    "name": "Selectel",
    "symbol": "SEL",
    "category": "infrastructure",
    "description": "Облако, VDS, сети, DNS и CDN Selectel",
    "website": "https://selectel.ru/",
    "status_page_url": "https://selectel.live/"
  },
  {
    "id": "mws",
    "name": "MWS / МТС Web Services",
    "symbol": "MWS",
    "category": "infrastructure",
    "description": "Облачная платформа МТС Web Services",
    "website": "https://mws.ru/",
    "status_page_url": null
  },
  {
    "id": "timeweb",
    "name": "Timeweb Cloud",
    "symbol": "TW",
    "category": "infrastructure",
    "description": "Облачная платформа Timeweb",
    "website": "https://timeweb.cloud/",
    "status_page_url": null
  },
  {
    "id": "reg_ru",
    "name": "REG.RU",
    "symbol": "REG",
    "category": "infrastructure",
    "description": "Хостинг, домены и облачные сервисы REG.RU",
    "website": "https://www.reg.ru/",
    "status_page_url": null
  },
  {
    "id": "beget",
    "name": "Beget",
    "symbol": "BE",
    "category": "infrastructure",
    "description": "Хостинг и облачные сервисы Beget",
    "website": "https://beget.com/",
    "status_page_url": null
  },
  {
    "id": "rostelecom_cloud",
    "name": "Ростелеком Cloud",
    "symbol": "РТК",
    "category": "infrastructure",
    "description": "Облачная платформа Ростелекома",
    "website": "https://cloud.rt.ru/",
    "status_page_url": null
  },
  {
    "id": "cdnvideo",
    "name": "CDNvideo",
    "symbol": "CDN",
    "category": "infrastructure",
    "description": "Российская CDN-платформа CDNvideo",
    "website": "https://www.cdnvideo.ru/",
    "status_page_url": null
  },
  {
    "id": "edgecenter",
    "name": "EdgeCenter",
    "symbol": "EC",
    "category": "infrastructure",
    "description": "CDN и cloud-инфраструктура EdgeCenter",
    "website": "https://edgecenter.ru/",
    "status_page_url": null
  },
  {
    "id": "qrator",
    "name": "Qrator",
    "symbol": "QR",
    "category": "infrastructure",
    "description": "Сетевая инфраструктура и DDoS-защита Qrator",
    "website": "https://qrator.net/",
    "status_page_url": null
  },
  {
    "id": "ngenix",
    "name": "NGENIX",
    "symbol": "NG",
    "category": "infrastructure",
    "description": "Российская CDN и edge-платформа NGENIX",
    "website": "https://ngenix.net/",
    "status_page_url": null
  },
  {
    "id": "mts",
    "name": "МТС",
    "symbol": "МТС",
    "category": "russian",
    "description": "Сайт оператора МТС",
    "website": "https://www.mts.ru/",
    "status_page_url": null
  },
  {
    "id": "megafon",
    "name": "МегаФон",
    "symbol": "МФ",
    "category": "russian",
    "description": "Сайт оператора МегаФон",
    "website": "https://megafon.ru/",
    "status_page_url": null
  },
  {
    "id": "beeline",
    "name": "Билайн",
    "symbol": "БЛ",
    "category": "russian",
    "description": "Сайт оператора Билайн",
    "website": "https://beeline.ru/",
    "status_page_url": null
  },
  {
    "id": "t2",
    "name": "Т2",
    "symbol": "T2",
    "category": "russian",
    "description": "Сайт оператора T2",
    "website": "https://t2.ru/",
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
    "status_page_url": null
  },
  {
    "id": "nominatim",
    "name": "Nominatim",
    "symbol": "NOM",
    "category": "mapping",
    "description": "Nominatim — поиск адресов и геокодирование OpenStreetMap",
    "website": "https://nominatim.openstreetmap.org/",
    "status_page_url": null
  },
  {
    "id": "beacondb",
    "name": "BeaconDB",
    "symbol": "BDB",
    "category": "mapping",
    "description": "BeaconDB — открытая база Wi-Fi и геолокационных данных",
    "website": "https://beacondb.net/",
    "status_page_url": null
  },
  {
    "id": "roblox",
    "name": "Roblox",
    "symbol": "RBX",
    "category": "gaming",
    "description": "Roblox — сайт и игровая платформа",
    "website": "https://www.roblox.com/",
    "status_page_url": "https://status.roblox.com/"
  },
  {
    "id": "rockstar",
    "name": "Rockstar Games",
    "symbol": "RG",
    "category": "gaming",
    "description": "Rockstar Games — сайт, аккаунты и игровые сервисы",
    "website": "https://www.rockstargames.com/",
    "status_page_url": "https://support.rockstargames.com/servicestatus"
  }
];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
const state = {
  data: null,
  historyCache: {},
  services: CATALOG.map(item => ({...item,status:"unknown",latest:null,uptime_24h:null,active_incidents:0})),
  incidents: [],
  health: null,
  overviewRange: "24h",
  historyRange: "24h",
  historyService: "telegram",
  overviewService: "telegram",
  loading: false
};
let refreshTimer = null;
let chartSequence = {overview:0,history:0};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function setConnection(message, kind="") {
  const note = $("#ss-connection-note");
  note.textContent = message;
  note.classList.toggle("is-error",kind==="error");
  note.classList.toggle("is-ok",kind==="ok");
  $("#ss-live-dot").classList.toggle("is-live",kind==="ok");
  $("#ss-live-dot").classList.toggle("is-error",kind==="error");
  $("#ss-live-label").textContent = kind==="ok" ? "GitHub Actions активен" : kind==="error" ? "Данные мониторинга устарели" : "GitHub Actions ожидает первую проверку";
}
function categoryLabel(category) {
  return ({platform:"Платформы",infrastructure:"Инфраструктура",communication:"Связь",media:"Медиа",development:"Разработка",search:"Поисковики",ai:"ИИ-сервисы",russian:"Российские сервисы",finance:"Банки и платежи",mapping:"Карты и геоданные",gaming:"Игры и игровые сервисы",commerce:"Магазины и маркетплейсы"})[category] || "Сервис";
}
function statusLabel(status) {
  return ({operational:"Работает",degraded:"Нестабильно",outage:"Сбой",maintenance:"Техработы",unknown:"Нет данных"})[status] || "Нет данных";
}
function formatMs(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) + " ms" : "—";
}
function formatPct(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(2) + "%" : "—";
}
function formatDate(seconds, options={}) {
  if (!seconds) return "—";
  const lang = window.siteI18n?.language === "en" ? "en-US" : "ru-RU";
  try { return new Intl.DateTimeFormat(lang,{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",...options}).format(new Date(seconds*1000)); }
  catch { return new Date(seconds*1000).toLocaleString(); }
}
function formatDuration(start,end) {
  if (!start) return "—";
  const total = Math.max(0,Math.floor(((end || Date.now()/1000)-start)/60));
  const days = Math.floor(total/1440), hours=Math.floor((total%1440)/60), mins=total%60;
  if (days) return days+" д "+hours+" ч";
  if (hours) return hours+" ч "+mins+" мин";
  return mins+" мин";
}
function setTab(tab) {
  $$(".ss-tab").forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle("is-active",active);
    button.setAttribute("aria-selected",String(active));
  });
  $$(".ss-tab-panel").forEach(panel => {
    const active = panel.dataset.panel === tab;
    panel.classList.toggle("is-active",active);
    panel.hidden = !active;
  });
  if (tab==="history") loadHistoryChart("history");
  if (tab==="overview") loadHistoryChart("overview");
  if (tab==="incidents") loadIncidents();
}
function serviceById(id) {
  return state.services.find(service => service.id === id) || CATALOG.find(service => service.id === id) || null;
}
function renderServiceCard(service) {
  const latest = service.latest || {};
  const status = service.status || "unknown";
  const uptime = service.uptime_24h == null ? "—" : Number(service.uptime_24h).toFixed(2)+"%";
  const latency = formatMs(latest.latency_ms);
  const checked = latest.checked_at ? formatDate(latest.checked_at) : "Нет измерений";
  const incidentCount = Number(service.active_incidents || 0);
  const statusSummary = latest.status_summary ? '<div class="ss-service-meta"><span>'+escapeHtml(latest.status_summary)+'</span></div>' : "";
  const officialIndicator = ({none:"норма",minor:"minor",major:"major",critical:"critical",maintenance:"maintenance"})[latest.status_indicator] || latest.status_indicator || "unknown";
  const officialStatus = latest.status_api_available
    ? '<div class="ss-service-official"><span>Официальный статус API</span><strong>'+escapeHtml(officialIndicator)+'</strong></div>'
    : (service.status_page_url ? '<div class="ss-service-official is-muted"><span>Источник статуса</span><strong>Страница провайдера</strong></div>' : "");
  const websiteLink = service.website
    ? '<a class="ss-service-outlink" href="'+escapeHtml(service.website)+'" target="_blank" rel="noopener noreferrer">Сайт ↗</a>'
    : "";
  const statusLink = service.status_page_url
    ? '<a class="ss-service-outlink" href="'+escapeHtml(service.status_page_url)+'" target="_blank" rel="noopener noreferrer">Официальный статус ↗</a>'
    : "";
  return '<article class="ss-service-card">'+
    '<div class="ss-service-top"><div class="ss-service-name-wrap"><span class="ss-service-symbol">'+escapeHtml(service.symbol || service.name.slice(0,2))+'</span><span class="ss-service-name">'+escapeHtml(service.name)+'</span></div><span class="ss-status '+escapeHtml(status)+'">'+escapeHtml(statusLabel(status))+'</span></div>'+
    '<div class="ss-service-description">'+escapeHtml(service.description || "")+'</div>'+
    '<div class="ss-service-metrics"><div><span>Задержка</span><strong>'+latency+'</strong></div><div><span>Uptime / 24 ч</span><strong>'+uptime+'</strong></div><div><span>HTTP</span><strong>'+(latest.http_status ? escapeHtml(latest.http_status) : "—")+'</strong></div></div>'+
    '<div class="ss-service-meta"><span>'+escapeHtml(checked)+'</span><span class="ss-service-incidents">'+(incidentCount ? incidentCount+" активн. инц." : "Без инцидентов")+'</span></div>'+
    statusSummary+officialStatus+
    '<div class="ss-service-actions"><button class="ss-service-open" type="button" data-service="'+escapeHtml(service.id)+'">График и история →</button>'+websiteLink+statusLink+'</div>'+
    '</article>';
}
function renderServices() {
  const cards = state.services.map(renderServiceCard).join("");
  $("#ss-overview-services").innerHTML = cards || '<div class="ss-empty-state">Список сервисов пуст.</div>';
  const search = ($("#ss-service-search")?.value || "").trim().toLowerCase();
  const category = $("#ss-category-filter")?.value || "all";
  const status = $("#ss-status-filter")?.value || "all";
  const filtered = state.services.filter(service => {
    const nameMatch = !search || (service.name+" "+service.description).toLowerCase().includes(search);
    const categoryMatch = category==="all" || service.category===category;
    const statusMatch = status==="all" || (status==="unknown" ? !service.latest : service.status===status);
    return nameMatch && categoryMatch && statusMatch;
  });
  $("#ss-all-services").innerHTML = filtered.length ? filtered.map(renderServiceCard).join("") : '<div class="ss-card ss-empty-state ss-no-results">Нет сервисов, подходящих под фильтр.</div>';
  $("#ss-service-count").textContent = filtered.length+" / "+state.services.length+" сервисов";
  populateServiceSelects();
}
function populateServiceSelects() {
  const selects = [$("#ss-overview-service"),$("#ss-history-service")];
  for (const select of selects) {
    if (!select) continue;
    const old = select.value || (select.id==="ss-history-service" ? state.historyService : state.overviewService);
    select.innerHTML = state.services.map(service => '<option value="'+escapeHtml(service.id)+'">'+escapeHtml(service.name)+'</option>').join("");
    select.value = state.services.some(service=>service.id===old) ? old : (state.services[0]?.id || "");
  }
  state.overviewService = $("#ss-overview-service")?.value || state.overviewService;
  state.historyService = $("#ss-history-service")?.value || state.historyService;
}
function renderMetrics() {
  const total = state.services.length;
  const measured = state.services.filter(service=>service.latest);
  const operational = measured.filter(service=>service.status==="operational").length;
  const upValues = state.services.map(service=>service.uptime_24h).filter(value=>value!==null && value!==undefined && Number.isFinite(Number(value)));
  const latencyValues = state.services.map(service=>service.latest?.latency_ms).filter(value=>value!==null && value!==undefined && Number.isFinite(Number(value)));
  $("#ss-total-services").textContent = String(total);
  $("#ss-operational").textContent = measured.length ? String(operational) : "—";
  $("#ss-uptime").textContent = upValues.length ? (upValues.reduce((a,b)=>a+Number(b),0)/upValues.length).toFixed(2)+"%" : "—";
  $("#ss-latency").textContent = latencyValues.length ? Math.round(latencyValues.reduce((a,b)=>a+Number(b),0)/latencyValues.length)+" ms" : "—";
}
function renderIncidents(target, incidents, limit=0) {
  const entries = limit ? incidents.slice(0,limit) : incidents;
  if (!entries.length) {
    target.innerHTML = '<div class="ss-empty-state">Инциденты за выбранный период не найдены.</div>';
    return;
  }
  target.innerHTML = entries.map(item => {
    const service = serviceById(item.service_id);
    const open = !item.ended_at;
    const major = item.severity==="major" || item.severity==="critical";
    return '<article class="ss-incident-row"><span class="ss-incident-mark '+(open ? (major?"major":"") : "resolved")+'"></span><div class="ss-incident-main"><strong>'+escapeHtml(service?.name || item.service_id)+' · '+(open?"Активный инцидент":"Инцидент завершён")+'</strong><p>'+escapeHtml(item.message || "Проблема доступности подтверждена мониторингом")+'</p></div><div class="ss-incident-times"><span>'+escapeHtml(formatDate(item.started_at))+'</span><span class="ss-incident-duration">'+escapeHtml(formatDuration(item.started_at,item.ended_at))+'</span></div></article>';
  }).join("");
}
function renderIncidentSummary(incidents) {
  const active = incidents.filter(item=>!item.ended_at).length;
  const resolved = incidents.filter(item=>item.ended_at).length;
  const severe = incidents.filter(item=>item.severity==="major"||item.severity==="critical").length;
  $("#ss-incident-summary").innerHTML = '<div><span>Всего событий</span><strong>'+incidents.length+'</strong></div><div><span>Активные</span><strong>'+active+'</strong></div><div><span>Серьёзные сбои</span><strong>'+severe+'</strong></div>';
}
async function loadIncidents() {
  const days = Number($("#ss-incident-period")?.value || 30);
  const cutoff = Math.floor(Date.now()/1000) - days*86400;
  const filtered = state.incidents.filter(item => Number(item.started_at || 0) >= cutoff);
  renderIncidents($("#ss-incidents"),filtered);
  renderIncidentSummary(filtered);
  renderIncidents($("#ss-overview-incidents"),state.incidents,4);
}
function linePath(points, accessor, x, y, bucketSeconds=0) {
  let path="", drawing=false, previousTimestamp=null;
  points.forEach(point => {
    const value = accessor(point);
    const timestamp = Number(point.timestamp);
    const gap = previousTimestamp!==null && bucketSeconds>0 && timestamp-previousTimestamp>bucketSeconds*1.5;
    if (value===null || value===undefined || !Number.isFinite(Number(value)) || gap) drawing=false;
    if (value===null || value===undefined || !Number.isFinite(Number(value))) {
      previousTimestamp=Number.isFinite(timestamp) ? timestamp : previousTimestamp;
      return;
    }
    path += (drawing ? "L" : "M") + x(timestamp).toFixed(1) + "," + y(Number(value)).toFixed(1) + " ";
    drawing=true;
    previousTimestamp=timestamp;
  });
  return path.trim();
}
function renderChart(container, response) {
  const points = response.points || [];
  if (!points.length) {
    container.innerHTML = '<div class="ss-empty-state">Для выбранного периода ещё нет сохранённых измерений. История начнёт заполняться после следующих запусков GitHub Actions.</div>';
    return;
  }
  const W=960,H=350,left=66,right=66,top=24,bottom=49,plotW=W-left-right,plotH=H-top-bottom;
  const maxLatencyRaw=Math.max(0,...points.map(point=>Number(point.avg_latency_ms)||0));
  const maxLatency=Math.max(100,Math.ceil(maxLatencyRaw*1.18/50)*50);
  const timeStart=Number(response.from || points[0].timestamp);
  const timeEnd=Number(response.to || (points[points.length-1].timestamp + Number(response.bucket_seconds || 300)));
  const timeSpan=Math.max(1,timeEnd-timeStart);
  const x=timestamp=>left+Math.max(0,Math.min(1,(Number(timestamp)-timeStart)/timeSpan))*plotW;
  const yLatency=value => top+plotH-(value/maxLatency)*plotH;
  const yUptime=value => top+plotH-(value/100)*plotH;
  let grid="";
  for(let i=0;i<=4;i++){
    const yy=top+plotH-(i/4)*plotH;
    const ms=(maxLatency*i/4);
    const pct=i*25;
    grid += '<line x1="'+left+'" y1="'+yy+'" x2="'+(W-right)+'" y2="'+yy+'" stroke="rgba(215,225,245,.10)" stroke-dasharray="3 5"/>';
    grid += '<text x="'+(left-11)+'" y="'+(yy+4)+'" text-anchor="end" fill="#8794a8" font-size="11">'+Math.round(ms)+'</text>';
    grid += '<text x="'+(W-right+11)+'" y="'+(yy+4)+'" text-anchor="start" fill="#80cfa9" font-size="11">'+pct+'%</text>';
  }
  const bucketSeconds=Number(response.bucket_seconds || 300);
  const latencyPath=linePath(points,point=>point.avg_latency_ms,timestamp=>x(timestamp),yLatency,bucketSeconds);
  const uptimePath=linePath(points,point=>point.uptime_pct,timestamp=>x(timestamp),yUptime,bucketSeconds);
  const isLongRange=response.range!=="24h";
  const axisOptions=isLongRange ? {day:"2-digit",month:"short",...(response.range==="365d"?{year:"2-digit"}:{})} : {hour:"2-digit",minute:"2-digit"};
  const labelFirst=formatDate(timeStart,axisOptions);
  const labelLast=formatDate(timeEnd,axisOptions);
  const labelMiddle=formatDate(Math.floor((timeStart+timeEnd)/2),axisOptions);
  const coverage=response.coverage_pct==null ? "—" : Number(response.coverage_pct).toFixed(1)+"%";
  container.innerHTML = '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Combined chart of HTTP latency and uptime">'+
    grid+
    (latencyPath?'<path d="'+latencyPath+'" fill="none" stroke="#aabaff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>':"")+
    (uptimePath?'<path d="'+uptimePath+'" fill="none" stroke="#7ddbb0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>':"")+
    '<line x1="'+left+'" y1="'+top+'" x2="'+left+'" y2="'+(top+plotH)+'" stroke="rgba(215,225,245,.2)"/>'+
    '<line x1="'+(W-right)+'" y1="'+top+'" x2="'+(W-right)+'" y2="'+(top+plotH)+'" stroke="rgba(125,219,176,.23)"/>'+
    '<text x="'+left+'" y="13" fill="#aabaff" font-size="10">Latency · ms</text><text x="'+(W-right)+'" y="13" text-anchor="end" fill="#7ddbb0" font-size="10">Uptime · %</text>'+
    '<text x="'+left+'" y="'+(H-14)+'" fill="#8491a5" font-size="10">'+escapeHtml(labelFirst)+'</text>'+
    '<text x="'+(W/2)+'" y="'+(H-14)+'" text-anchor="middle" fill="#8491a5" font-size="10">'+escapeHtml(labelMiddle)+'</text>'+
    '<text x="'+(W-right)+'" y="'+(H-14)+'" text-anchor="end" fill="#8491a5" font-size="10">'+escapeHtml(labelLast)+'</text>'+
    '</svg>';
  $("#"+(container.id==="ss-history-chart"?"ss-history-summary":"ss-overview-chart-foot")).dataset.coverage=coverage;
}
function historyResponse(serviceId, range) {
  const settings = {
    "24h": {seconds:86400,bucket:300,source:"24h"},
    "7d": {seconds:604800,bucket:900,source:"7d"},
    "30d": {seconds:2592000,bucket:3600,source:"30d"},
    "90d": {seconds:7776000,bucket:86400,source:"365d"},
    "365d": {seconds:31536000,bucket:86400,source:"365d"}
  }[range];
  if (!settings || !state.data) throw new Error("История пока недоступна.");
  const now = Number(state.data.last_check_at || state.data.generated_at || Math.floor(Date.now()/1000));
  const exactFrom = now - settings.seconds;
  const from = settings.bucket===86400 ? Math.ceil(exactFrom/86400)*86400 : exactFrom;
  const stored = state.historyCache?.[serviceId]?.[settings.source] || [];
  const rawPoints = stored.filter(point => Number(point[0]) >= from && Number(point[0]) <= now);
  const points = rawPoints.map(point => {
    const checks = Number(point[1] || 0);
    const successful = Number(point[2] || 0);
    const latencySum = Number(point[3] || 0);
    const latencySamples = Number(point[4] || 0);
    return {
      timestamp:Number(point[0]),
      checks,
      successful,
      failed:Math.max(0,checks-successful),
      uptime_pct:checks ? Number((successful/checks*100).toFixed(2)) : null,
      avg_latency_ms:latencySamples ? Number((latencySum/latencySamples).toFixed(2)) : null,
      latency_samples:latencySamples,
      min_latency_ms:point[5]===null ? null : Number(point[5]),
      max_latency_ms:point[6]===null ? null : Number(point[6])
    };
  });
  const checks = points.reduce((sum,point)=>sum+point.checks,0);
  const successful = points.reduce((sum,point)=>sum+point.successful,0);
  const latencySamples = points.reduce((sum,point)=>sum+point.latency_samples,0);
  const latencySum = rawPoints.reduce((sum,point)=>sum+Number(point[3]||0),0);
  const expected = Math.max(1,Math.ceil((now-from)/300));
  return {
    service_id:serviceId,
    range,
    bucket_seconds:settings.bucket,
    from,
    to:now,
    checks,
    successful,
    failed:checks-successful,
    uptime_pct:checks ? Number((successful/checks*100).toFixed(4)) : null,
    coverage_pct:Number(Math.min(100,checks/expected*100).toFixed(2)),
    avg_latency_ms:latencySamples ? Number((latencySum/latencySamples).toFixed(2)) : null,
    points
  };
}
async function loadHistoryChart(which) {
  const container = which==="history" ? $("#ss-history-chart") : $("#ss-overview-chart");
  const serviceId = which==="history" ? ($("#ss-history-service")?.value || state.historyService) : ($("#ss-overview-service")?.value || state.overviewService);
  const range = which==="history" ? state.historyRange : state.overviewRange;
  const sequence=++chartSequence[which];
  if (!state.data) {
    container.innerHTML='<div class="ss-empty-state">История появится после первой автоматической проверки GitHub Actions.</div>';
    return;
  }
  container.innerHTML='<div class="ss-empty-state">Загружаю историю измерений…</div>';
  try {
    if(!state.historyCache[serviceId]){
      const historyUrl="/data/service-status/history/"+encodeURIComponent(serviceId)+".json?nocache="+Date.now();
      const response=await fetch(historyUrl,{headers:{Accept:"application/json","Cache-Control":"no-cache"},cache:"no-store"});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const payload=await response.json();
      if(!payload || payload.service_id!==serviceId || !payload.history)throw new Error("Файл истории имеет неверный формат.");
      state.historyCache[serviceId]=payload.history;
    }
    const result=historyResponse(serviceId,range);
    if(sequence!==chartSequence[which])return;
    renderChart(container,result);
    if(which==="history"){
      $("#ss-history-period-label").textContent=({"24h":"24 часа","7d":"7 дней","30d":"30 дней","90d":"90 дней","365d":"365 дней"})[range] || range;
      const summary=$("#ss-history-summary");
      summary.innerHTML=[
        ["Uptime за период",formatPct(result.uptime_pct)],
        ["Средняя задержка",formatMs(result.avg_latency_ms)],
        ["Проверок",Number(result.checks||0).toLocaleString()],
        ["Покрытие мониторингом",formatPct(result.coverage_pct)]
      ].map(([label,value])=>'<div><span>'+escapeHtml(label)+'</span><strong>'+escapeHtml(value)+'</strong></div>').join("");
    } else {
      $("#ss-overview-chart-caption").textContent=(serviceById(serviceId)?.name || serviceId)+" · "+({"24h":"24 часа","7d":"7 дней","30d":"30 дней"})[range];
      $("#ss-overview-chart-foot").textContent="Покрытие: "+formatPct(result.coverage_pct)+". Левая шкала — миллисекунды; правая — доступность.";
    }
  } catch(error) {
    if(sequence!==chartSequence[which])return;
    container.innerHTML='<div class="ss-empty-state">Ошибка загрузки истории: '+escapeHtml(error.message)+'</div>';
  }
}

function setRange(which,range) {
  if(which==="overview")state.overviewRange=range;else state.historyRange=range;
  $$('.ss-range-group[data-range-group="'+which+'"] button').forEach(button=>button.classList.toggle("is-active",button.dataset.range===range));
  loadHistoryChart(which);
}
async function loadAll({quiet=false}={}) {
  if(state.loading)return;
  state.loading=true;
  if(!quiet)$("#ss-last-update").textContent="Обновляю…";
  try {
    const response=await fetch("/data/service-status.json?nocache="+Date.now(),{
      method:"GET",
      headers:{Accept:"application/json","Cache-Control":"no-cache"},
      cache:"no-store"
    });
    if(!response.ok)throw new Error("HTTP "+response.status);
    const data=await response.json();
    if(!data || !Array.isArray(data.services) || !data.schema_version)throw new Error("Некорректный файл данных мониторинга.");
    const snapshotChanged=!state.data || state.data.generated_at!==data.generated_at;
    state.data=data;
    if(snapshotChanged)state.historyCache={};
    state.health={
      service_count:Number(data.summary?.service_count || data.services.length),
      interval_minutes:Number(data.interval_seconds || 300)/60,
      retention_days:Number(data.retention_days || 365),
      last_check_at:Number(data.last_check_at || data.generated_at || 0)
    };
    state.services=data.services.map(item=>({...((CATALOG.find(c=>c.id===item.id)||{})),...item}));
    state.incidents=Array.isArray(data.incidents) ? data.incidents : [];
    renderServices();
    renderMetrics();
    renderIncidents($("#ss-overview-incidents"),state.incidents,4);
    const last=state.health.last_check_at;
    const ageSeconds=last ? Math.max(0,Date.now()/1000-last) : Infinity;
    const isStale=ageSeconds>15*60;
    const checkedTime=last ? new Date(last*1000).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) : "нет";
    $("#ss-last-update").textContent=last ? "Проверено "+checkedTime : "Данные ещё не получены";
    $("#ss-footer-state").textContent="GitHub Actions · "+state.health.interval_minutes+" min · "+state.health.retention_days+" days";
    const note=isStale
      ? "Последняя проверка была "+Math.round(ageSeconds/60)+" мин назад. GitHub Actions может задерживать запуск; показаны последние сохранённые результаты."
      : "Проверки выполняются GitHub Actions примерно каждые "+state.health.interval_minutes+" минут. История хранится до "+state.health.retention_days+" дней.";
    setConnection(note,isStale ? "error" : "ok");
    if($("#ss-tab-overview").classList.contains("is-active"))loadHistoryChart("overview");
    if($("#ss-tab-history").classList.contains("is-active"))loadHistoryChart("history");
  } catch(error) {
    setConnection("Не удалось загрузить опубликованные данные мониторинга: "+error.message+". Проверь запуск GitHub Actions.", "error");
    $("#ss-last-update").textContent="Ошибка загрузки";
    if(!quiet)$("#ss-overview-chart").innerHTML='<div class="ss-empty-state">Пока нет опубликованных измерений. Открой GitHub Actions и проверь первый запуск.</div>';
  } finally {
    state.loading=false;
  }
}
function bindEvents() {
  $$(".ss-tab").forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.tab)));
  $$("[data-open-tab]").forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.openTab)));
  $("#ss-refresh").addEventListener("click",()=>loadAll());
  $("#ss-service-search").addEventListener("input",renderServices);
  $("#ss-category-filter").addEventListener("change",renderServices);
  $("#ss-status-filter").addEventListener("change",renderServices);
  $("#ss-overview-service").addEventListener("change",event=>{state.overviewService=event.target.value;loadHistoryChart("overview");});
  $("#ss-history-service").addEventListener("change",event=>{state.historyService=event.target.value;loadHistoryChart("history");});
  $("#ss-incident-period").addEventListener("change",loadIncidents);
  $$(".ss-range-group button").forEach(button=>button.addEventListener("click",()=>setRange(button.closest(".ss-range-group").dataset.rangeGroup,button.dataset.range)));
  document.addEventListener("click",event=>{
    const card=event.target.closest("[data-service]");
    if(!card)return;
    const id=card.dataset.service;
    state.overviewService=id;state.historyService=id;
    $("#ss-overview-service").value=id;$("#ss-history-service").value=id;
    setTab("history");
  });
}
bindEvents();
populateServiceSelects();
renderServices();
renderMetrics();
loadAll();
refreshTimer=setInterval(()=>loadAll({quiet:true}),60000);
})();
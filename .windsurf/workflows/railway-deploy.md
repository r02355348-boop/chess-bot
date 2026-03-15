---
description: Deploy Chess Mini App to Railway for free with auto-generated domain
---

# Деплой шахматного Mini App на Railway (бесплатно)

## 1. Подготовка

// turbo
Убедись, что проект запушен на GitHub:
```bash
git init
git add .
git commit -m "Initial chess app"
git remote add origin https://github.com/YOUR_USERNAME/chess-bot.git
git push -u origin main
```

## 2. Регистрация на Railway

1. Открой [railway.app](https://railway.app)
2. Нажми **Start for Free** (Google/GitHub авторизация)
3. Подтверди email

## 3. Создание проекта

1. В дашборде Railway нажми **New Project**
2. Выбери **Deploy from GitHub repo**
3. Подключи свой GitHub аккаунт
4. Выбери репозиторий `sticker-bot`

## 4. Настройка переменных окружения

Перейди в раздел **Variables** и добавь:

```
BOT_TOKEN=8317781871:AAEiwOihpARDrSX9sOiPt_XSxQQVozT9qPw
WEBAPP_URL=https://your-project-name.railway.app
WEBAPP_HOST=0.0.0.0
WEBAPP_PORT=8080
```

// turbo
Railway автоматически даст домен вида `your-project-name.railway.app` — скопируй его и обнови `WEBAPP_URL`

## 5. Настройка запуска

Создай файл `Procfile` в корне проекта:
```
web: python server.py
```

// turbo
Запушь изменения:
```bash
git add Procfile
git commit -m "Add Procfile"
git push
```

## 6. Деплой

Railway автоматически задеплоит проект при пуше.

- Перейди в раздел **Deployments** — увидишь статус
- После успеха перейди в **Settings** → **Public URL** — это твой домен!

## 7. Обновление WebApp URL в боте

// turbo
Обнови `WEBAPP_URL` в Railway Variables на реальный домен:
```
WEBAPP_URL=https://chess-bot-production.up.railway.app
```

## 8. Настройка Telegram WebApp

Напиши [@BotFather](https://t.me/BotFather):

1. `/mybots` → выбери свой бот
2. `Bot Settings` → `Menu Button` → `Configure menu button`
3. **Menu button text**: `♟️ Играть`
4. **URL**: твой Railway домен

## 9. Запуск бота (опционально)

Для бота можно использовать:
- **Webhook**: настрой через BotFather + Railway endpoint
- **Polling**: запусти локально или на другом сервисе

## Проверка

Открой бота в Telegram → нажми кнопку → должно открыться Mini App!

## Troubleshooting

**WebSocket не работает?**
- Railway поддерживает WebSocket из коробки
- Проверь, что клиент подключается к `wss://` (Secure WebSocket)

**Мини-приложение не открывается?**
- Проверь `WEBAPP_URL` в переменных Railway
- Убедись, что HTTPS используется (Railway дает автоматически)

**500 ошибка?**
- Проверь логи в Railway Dashboard → Deployments → View Logs

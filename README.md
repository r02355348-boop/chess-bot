# Chess Online - Telegram Mini App

Real-time online chess in Telegram with real players.

## Features

- Real-time online play via WebSocket
- Blitz mode (5 minutes per game)
- Automatic matchmaking
- Player statistics and rating
- Resign and draw offer options
- Full mobile support

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```
BOT_TOKEN=your_telegram_bot_token
WEBAPP_URL=https://your-domain.com
WEBAPP_HOST=0.0.0.0
WEBAPP_PORT=8080
```

3. Run server:
```bash
python server.py
```

4. Run bot (in another terminal):
```bash
python bot.py
```

## Bot Setup

1. Message @BotFather to create a bot
2. Get token and add to .env
3. Enable Web App via BotFather

## How to Play

1. Find the bot in Telegram, press Start
2. Press Play Chess button
3. Click Find Game in Mini App
4. Wait for opponent match
5. Play!

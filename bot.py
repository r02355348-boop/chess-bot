import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://your-domain.com")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="♟️ Играть в шахматы", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )],
        [InlineKeyboardButton(
            text="📊 Моя статистика", 
            callback_data="stats"
        )],
        [InlineKeyboardButton(
            text="❓ Помощь", 
            callback_data="help"
        )]
    ])
    
    await message.answer(
        f"👋 Привет, {message.from_user.first_name}!\n\n"
        "Добро пожаловать в ♟️ Chess Online — онлайн шахматы в Telegram!\n\n"
        "🎮 Играй в реальном времени с реальными игроками\n"
        "⚡ Быстрые партии (5 минут)\n"
        "📊 Отслеживай свою статистику\n\n"
        "Нажми кнопку ниже, чтобы начать игру!",
        reply_markup=keyboard
    )

@dp.message(Command("play"))
async def cmd_play(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎮 Начать игру", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "♟️ Готов к игре?\n\n"
        "Нажми кнопку ниже для перехода в шахматы:",
        reply_markup=keyboard
    )

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    help_text = (
        "♟️ <b>Chess Online — Помощь</b>\n\n"
        "<b>Команды:</b>\n"
        "/start — Главное меню\n"
        "/play — Быстрый доступ к игре\n"
        "/help — Показать это сообщение\n\n"
        "<b>Как играть:</b>\n"
        "1. Нажмите «Играть в шахматы»\n"
        "2. Нажмите «Найти игру»\n"
        "3. Ждите противника\n"
        "4. Играйте!\n\n"
        "<b>Правила:</b>\n"
        "• Блиц (5 минут на партию)\n"
        "• Автоматические ничья при пате\n"
        "• Можно сдаться или предложить ничью\n\n"
        "<b>Поддержка:</b> @your_support"
    )
    
    await message.answer(help_text, parse_mode="HTML")

@dp.callback_query(F.data == "stats")
async def show_stats(callback: types.CallbackQuery):
    # TODO: Get stats from database
    user = callback.from_user
    
    stats_text = (
        f"📊 <b>Статистика {user.first_name}</b>\n\n"
        "🏆 Побед: 0\n"
        "❌ Поражений: 0\n"
        "🤝 Ничьих: 0\n"
        "📈 Рейтинг: 1000\n"
        "🎮 Всего игр: 0\n\n"
        "<i>Статистика обновляется после каждой игры</i>"
    )
    
    await callback.answer()
    await callback.message.answer(stats_text, parse_mode="HTML")

@dp.callback_query(F.data == "help")
async def show_help(callback: types.CallbackQuery):
    await callback.answer()
    await cmd_help(callback.message)

@dp.message()
async def any_message(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="♟️ Играть в шахматы", 
            web_app=WebAppInfo(url=WEBAPP_URL)
        )]
    ])
    
    await message.answer(
        "Используй меню ниже или команду /play для начала игры:",
        reply_markup=keyboard
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

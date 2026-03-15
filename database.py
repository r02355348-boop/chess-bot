import aiosqlite
from datetime import datetime
from typing import Optional, Dict, List

class Database:
    def __init__(self, db_path: str = "chess.db"):
        self.db_path = db_path
    
    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    white_id TEXT NOT NULL,
                    black_id TEXT NOT NULL,
                    fen TEXT NOT NULL,
                    moves TEXT DEFAULT '[]',
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ended_at TIMESTAMP,
                    status TEXT DEFAULT 'active',
                    winner TEXT,
                    reason TEXT
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT,
                    first_name TEXT,
                    games_played INTEGER DEFAULT 0,
                    wins INTEGER DEFAULT 0,
                    losses INTEGER DEFAULT 0,
                    draws INTEGER DEFAULT 0,
                    rating INTEGER DEFAULT 1000,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            await db.commit()
    
    async def save_user(self, user_id: str, username: Optional[str], first_name: Optional[str]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT OR IGNORE INTO users (user_id, username, first_name)
                VALUES (?, ?, ?)
            ''', (user_id, username, first_name))
            await db.commit()
    
    async def get_user_stats(self, user_id: str) -> Optional[Dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                'SELECT * FROM users WHERE user_id = ?', (user_id,)
            ) as cursor:
                row = await cursor.fetchone()
                return dict(row) if row else None
    
    async def update_user_stats(self, user_id: str, result: str):
        async with aiosqlite.connect(self.db_path) as db:
            if result == 'win':
                await db.execute('''
                    UPDATE users SET 
                        games_played = games_played + 1,
                        wins = wins + 1,
                        rating = rating + 15
                    WHERE user_id = ?
                ''', (user_id,))
            elif result == 'loss':
                await db.execute('''
                    UPDATE users SET 
                        games_played = games_played + 1,
                        losses = losses + 1,
                        rating = MAX(100, rating - 15)
                    WHERE user_id = ?
                ''', (user_id,))
            elif result == 'draw':
                await db.execute('''
                    UPDATE users SET 
                        games_played = games_played + 1,
                        draws = draws + 1,
                        rating = rating + 5
                    WHERE user_id = ?
                ''', (user_id,))
            await db.commit()
    
    async def save_game(self, game_id: str, white_id: str, black_id: str, fen: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT INTO games (id, white_id, black_id, fen, status)
                VALUES (?, ?, ?, ?, 'active')
            ''', (game_id, white_id, black_id, fen))
            await db.commit()
    
    async def update_game(self, game_id: str, fen: str, moves: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                UPDATE games SET fen = ?, moves = ? WHERE id = ?
            ''', (fen, moves, game_id))
            await db.commit()
    
    async def finish_game(self, game_id: str, winner: Optional[str], reason: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                UPDATE games SET 
                    status = 'finished',
                    winner = ?,
                    reason = ?,
                    ended_at = ?
                WHERE id = ?
            ''', (winner, reason, datetime.now(), game_id))
            await db.commit()
    
    async def get_user_games(self, user_id: str, limit: int = 10) -> List[Dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute('''
                SELECT * FROM games 
                WHERE white_id = ? OR black_id = ?
                ORDER BY started_at DESC
                LIMIT ?
            ''', (user_id, user_id, limit)) as cursor:
                rows = await cursor.fetchall()
                return [dict(row) for row in rows]

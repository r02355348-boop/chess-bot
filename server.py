import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Optional, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from starlette.requests import Request
import chess
import aiosqlite
import os

app = FastAPI()

# Get the directory where server.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mount static files with absolute path
static_dir = os.path.join(BASE_DIR, "webapp", "static")
templates_dir = os.path.join(BASE_DIR, "webapp", "templates")

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=templates_dir)

# Game state management
class GameManager:
    def __init__(self):
        self.waiting_players: Dict[str, dict] = {}  # user_id -> player info
        self.active_games: Dict[str, dict] = {}   # game_id -> game info
        self.connections: Dict[str, WebSocket] = {}  # user_id -> websocket
        
    async def add_player(self, user_id: str, websocket: WebSocket):
        self.connections[user_id] = websocket
    
    async def find_game(self, user_id: str):
        # Try to find opponent
        opponent = await self.find_opponent(user_id)
        if opponent:
            await self.create_game(user_id, opponent)
        else:
            # Add to waiting queue
            self.waiting_players[user_id] = {
                'joined_at': datetime.now()
            }
    
    async def cancel_matchmaking(self, user_id: str):
        if user_id in self.waiting_players:
            del self.waiting_players[user_id]
    
    async def find_opponent(self, user_id: str) -> Optional[str]:
        # Find first waiting player who is not the current user
        for waiting_id, info in list(self.waiting_players.items()):
            if waiting_id != user_id:
                del self.waiting_players[waiting_id]
                return waiting_id
        return None
    
    async def create_game(self, white_id: str, black_id: str):
        game_id = str(uuid.uuid4())[:8]
        
        # Create chess board
        board = chess.Board()
        
        game = {
            'id': game_id,
            'white': white_id,
            'black': black_id,
            'board_fen': board.fen(),
            'started_at': datetime.now(),
            'last_move_at': datetime.now(),
            'moves': [],
            'status': 'active',
            'time_left': {'w': 300000, 'b': 300000}  # 5 minutes per player
        }
        
        self.active_games[game_id] = game
        
        # Notify players
        white_ws = self.connections.get(white_id)
        black_ws = self.connections.get(black_id)
        
        if white_ws:
            await white_ws.send_json({
                'event': 'game_found',
                'gameId': game_id,
                'color': 'w',
                'fen': board.fen()
            })
        
        if black_ws:
            await black_ws.send_json({
                'event': 'game_found',
                'gameId': game_id,
                'color': 'b',
                'fen': board.fen()
            })
        
        # Start game timer
        asyncio.create_task(self.game_timer(game_id))
        
        # Save to database
        await self.save_game_to_db(game)
    
    async def game_timer(self, game_id: str):
        """Handle game timer updates"""
        while game_id in self.active_games:
            game = self.active_games.get(game_id)
            if not game or game['status'] != 'active':
                break
            
            # Decrement time for current player
            board = chess.Board(game['board_fen'])
            current_color = 'w' if board.turn == chess.WHITE else 'b'
            
            game['time_left'][current_color] -= 1000
            
            if game['time_left'][current_color] <= 0:
                # Time out - game over
                await self.handle_timeout(game_id, current_color)
                break
            
            # Notify both players of time update
            for user_id in [game['white'], game['black']]:
                ws = self.connections.get(user_id)
                if ws:
                    try:
                        await ws.send_json({
                            'event': 'time_update',
                            'times': game['time_left']
                        })
                    except:
                        pass
            
            await asyncio.sleep(1)
    
    async def handle_timeout(self, game_id: str, timeout_color: str):
        game = self.active_games.get(game_id)
        if not game:
            return
        
        winner = 'black' if timeout_color == 'w' else 'white'
        await self.end_game(game_id, winner, 'timeout')
    
    async def handle_move(self, user_id: str, game_id: str, move_data: dict):
        game = self.active_games.get(game_id)
        if not game or game['status'] != 'active':
            return
        
        # Verify it's the player's turn
        board = chess.Board(game['board_fen'])
        is_white_turn = board.turn == chess.WHITE
        
        if (is_white_turn and user_id != game['white']) or \
           (not is_white_turn and user_id != game['black']):
            return
        
        # Parse and validate move
        from_sq = chess.square(move_data['from']['col'], 7 - move_data['from']['row'])
        to_sq = chess.square(move_data['to']['col'], 7 - move_data['to']['row'])
        
        promotion = move_data.get('promotion')
        if promotion:
            promotion_map = {'q': chess.QUEEN, 'r': chess.ROOK, 'b': chess.BISHOP, 'n': chess.KNIGHT}
            promotion = promotion_map.get(promotion.lower())
        
        move = chess.Move(from_sq, to_sq, promotion)
        
        if move not in board.legal_moves:
            ws = self.connections.get(user_id)
            if ws:
                await ws.send_json({'event': 'error', 'message': 'Недопустимый ход'})
            return
        
        # Apply move
        board.push(move)
        game['board_fen'] = board.fen()
        game['moves'].append(move_data)
        game['last_move_at'] = datetime.now()
        
        # Notify opponent
        opponent_id = game['black'] if user_id == game['white'] else game['white']
        opponent_ws = self.connections.get(opponent_id)
        
        if opponent_ws:
            await opponent_ws.send_json({
                'event': 'opponent_move',
                'move': move_data
            })
        
        # Check for game end
        if board.is_checkmate():
            winner = 'white' if is_white_turn else 'black'
            await self.end_game(game_id, winner, 'checkmate')
        elif board.is_stalemate() or board.is_insufficient_material() or board.is_fifty_moves():
            await self.end_game(game_id, None, 'draw')
    
    async def end_game(self, game_id: str, winner: Optional[str], reason: str):
        game = self.active_games.get(game_id)
        if not game:
            return
        
        game['status'] = 'finished'
        game['winner'] = winner
        game['reason'] = reason
        game['ended_at'] = datetime.now()
        
        # Notify players
        result_map = {
            'white': {'white': 'win', 'black': 'loss'},
            'black': {'white': 'loss', 'black': 'win'},
            None: {'white': 'draw', 'black': 'draw'}
        }
        
        for color, user_id in [('white', game['white']), ('black', game['black'])]:
            ws = self.connections.get(user_id)
            if ws:
                try:
                    await ws.send_json({
                        'event': 'game_over',
                        'result': result_map[winner][color],
                        'reason': reason
                    })
                except:
                    pass
        
        # Update database
        await self.update_game_in_db(game)
        
        # Clean up
        del self.active_games[game_id]
    
    async def save_game_to_db(self, game: dict):
        async with aiosqlite.connect('chess.db') as db:
            await db.execute('''
                INSERT INTO games (id, white_id, black_id, fen, started_at, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (game['id'], game['white'], game['black'], 
                  game['board_fen'], game['started_at'], game['status']))
            await db.commit()
    
    async def update_game_in_db(self, game: dict):
        async with aiosqlite.connect('chess.db') as db:
            await db.execute('''
                UPDATE games SET 
                    fen = ?, 
                    moves = ?, 
                    status = ?, 
                    winner = ?, 
                    ended_at = ?,
                    reason = ?
                WHERE id = ?
            ''', (game['board_fen'], json.dumps(game['moves']), 
                  game['status'], game.get('winner'), 
                  game.get('ended_at'), game.get('reason'), game['id']))
            await db.commit()
    
    async def handle_resign(self, user_id: str, game_id: str):
        game = self.active_games.get(game_id)
        if not game:
            return
        
        if user_id == game['white']:
            await self.end_game(game_id, 'black', 'resignation')
        elif user_id == game['black']:
            await self.end_game(game_id, 'white', 'resignation')
    
    def remove_player(self, user_id: str):
        if user_id in self.waiting_players:
            del self.waiting_players[user_id]
        if user_id in self.connections:
            del self.connections[user_id]

game_manager = GameManager()

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    
    try:
        # Wait for initial connection with user info
        data = await websocket.receive_json()
        if data.get('event') == 'connect':
            user_id = data.get('userId')
            if not user_id:
                await websocket.close()
                return
            
            await game_manager.add_player(user_id, websocket)
            
            # Main message loop
            while True:
                data = await websocket.receive_json()
                event = data.get('event')
                
                if event == 'find_game':
                    await game_manager.find_game(user_id)
                elif event == 'cancel_matchmaking':
                    await game_manager.cancel_matchmaking(user_id)
                elif event == 'move':
                    await game_manager.handle_move(
                        user_id, 
                        data.get('gameId'), 
                        data.get('move')
                    )
                elif event == 'resign':
                    await game_manager.handle_resign(user_id, data.get('gameId'))
                elif event == 'timeout':
                    await game_manager.handle_timeout(data.get('gameId'), data.get('color'))
                    
    except WebSocketDisconnect:
        if user_id:
            game_manager.remove_player(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if user_id:
            game_manager.remove_player(user_id)

# Initialize database on startup
@app.on_event("startup")
async def startup():
    async with aiosqlite.connect('chess.db') as db:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

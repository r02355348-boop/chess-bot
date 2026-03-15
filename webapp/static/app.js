// Main Telegram Mini App for Chess
const tg = window.Telegram.WebApp;

class ChessApp {
    constructor() {
        this.socket = null;
        this.game = new Chess();
        this.userId = null;
        this.gameId = null;
        this.playerColor = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = false;
        this.timeLeft = { w: 300000, b: 300000 }; // 5 minutes in ms
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        tg.ready();
        tg.expand();
        
        // Get user data from Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            this.userId = tg.initDataUnsafe.user.id;
        }
        
        this.setupEventListeners();
        this.renderBoard();
    }

    connectSocket() {
        const wsUrl = `wss://${window.location.host}/ws`;
        console.log('Connecting to:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.socket.send(JSON.stringify({
                event: 'connect',
                userId: this.userId
            }));
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            this.handleServerMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Auto reconnect
            setTimeout(() => this.connectSocket(), 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleServerMessage(data) {
        const event = data.event || data.type;
        
        switch (event) {
            case 'game_found':
                this.gameId = data.gameId;
                this.playerColor = data.color;
                this.startGame(data.fen);
                break;
            case 'opponent_move':
                this.handleOpponentMove(data.move);
                break;
            case 'game_over':
                this.endGame(data.result, data.reason);
                break;
            case 'time_update':
                this.timeLeft = data.times;
                this.updateTimers();
                break;
            case 'error':
                this.showNotification(data.message, 'error');
                break;
        }
    }

    sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('btn-find-game').addEventListener('click', () => this.findGame());
        document.getElementById('btn-cancel').addEventListener('click', () => this.cancelMatchmaking());
        document.getElementById('btn-resign').addEventListener('click', () => this.resign());
        document.getElementById('btn-draw').addEventListener('click', () => this.offerDraw());
        document.getElementById('btn-new-game').addEventListener('click', () => this.showMainMenu());
        
        // Board click handler
        document.getElementById('chessboard').addEventListener('click', (e) => this.handleBoardClick(e));
    }

    findGame() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connectSocket();
        }

        document.getElementById('matchmaking-status').classList.remove('hidden');
        document.querySelector('.menu-buttons').classList.add('hidden');
        
        // Wait for connection then send find_game
        setTimeout(() => {
            this.sendMessage({ event: 'find_game', userId: this.userId });
        }, 500);
    }

    cancelMatchmaking() {
        document.getElementById('matchmaking-status').classList.add('hidden');
        document.querySelector('.menu-buttons').classList.remove('hidden');
        
        this.sendMessage({ event: 'cancel_matchmaking' });
    }

    startGame(fen) {
        this.showScreen('game-screen');
        
        // Reset game
        this.game = new Chess();
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = this.playerColor === 'w';
        
        this.renderBoard();
        this.updatePlayerInfo();
        this.startTimer();
    }

    renderBoard() {
        const board = document.getElementById('chessboard');
        board.innerHTML = '';
        
        const isFlipped = this.playerColor === 'b';
        
        for (let row = 0; row < 8; row++) {
            const displayRow = isFlipped ? 7 - row : row;
            const rowEl = document.createElement('div');
            rowEl.className = 'board-row';
            
            for (let col = 0; col < 8; col++) {
                const displayCol = isFlipped ? 7 - col : col;
                const square = document.createElement('div');
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = displayRow;
                square.dataset.col = displayCol;
                
                const piece = this.game.board[displayRow][displayCol];
                if (piece) {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = `piece ${this.game.isWhitePiece(piece) ? 'white' : 'black'}`;
                    pieceEl.textContent = this.game.getPieceSymbol(piece);
                    square.appendChild(pieceEl);
                }
                
                // Highlight selected square
                if (this.selectedSquare && 
                    this.selectedSquare.row === displayRow && 
                    this.selectedSquare.col === displayCol) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                const validMove = this.validMoves.find(m => 
                    m.to.row === displayRow && m.to.col === displayCol
                );
                if (validMove) {
                    if (validMove.capture) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                rowEl.appendChild(square);
            }
            board.appendChild(rowEl);
        }
    }

    handleBoardClick(e) {
        if (!this.isMyTurn) return;
        
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // Check if clicking a valid move target
        const validMove = this.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (validMove) {
            this.makeMove(validMove);
            return;
        }
        
        // Select piece
        const piece = this.game.board[row][col];
        if (piece && this.game.isOwnPiece(piece, this.playerColor)) {
            this.selectedSquare = { row, col };
            this.validMoves = this.game.getMoves(row, col);
            this.renderBoard();
        } else {
            this.selectedSquare = null;
            this.validMoves = [];
            this.renderBoard();
        }
    }

    makeMove(move) {
        // Handle promotion
        if (move.promotion) {
            this.showPromotionModal(move);
            return;
        }
        
        this.executeMove(move);
    }

    showPromotionModal(pendingMove) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Выберите фигуру</h3>
                <div class="promotion-pieces">
                    <div class="promotion-piece" data-piece="q">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'Q' : 'q')}</div>
                    <div class="promotion-piece" data-piece="r">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'R' : 'r')}</div>
                    <div class="promotion-piece" data-piece="b">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'B' : 'b')}</div>
                    <div class="promotion-piece" data-piece="n">${this.game.getPieceSymbol(this.playerColor === 'w' ? 'N' : 'n')}</div>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            const piece = e.target.closest('.promotion-piece');
            if (piece) {
                pendingMove.promotion = piece.dataset.piece;
                document.body.removeChild(modal);
                this.executeMove(pendingMove);
            }
        });
        
        document.body.appendChild(modal);
    }

    executeMove(move) {
        // Apply move locally
        this.game.makeMove(move);
        
        // Send to server
        this.sendMessage({
            event: 'move',
            gameId: this.gameId,
            move: move
        });
        
        // Update UI
        this.selectedSquare = null;
        this.validMoves = [];
        this.isMyTurn = false;
        this.renderBoard();
        this.updateStatus();
        
        // Check for game end
        this.checkGameEnd();
    }

    handleOpponentMove(moveData) {
        this.game.makeMove(moveData);
        this.isMyTurn = true;
        this.renderBoard();
        this.updateStatus();
        this.checkGameEnd();
    }

    updateStatus() {
        if (this.game.isInCheck(this.playerColor)) {
            this.showNotification('Ваш король под шахом!');
        }
    }

    checkGameEnd() {
        let result = null;
        let reason = '';
        
        if (this.game.isCheckmate()) {
            result = this.game.turn === this.playerColor ? 'loss' : 'win';
            reason = 'Мат';
        } else if (this.game.isStalemate()) {
            result = 'draw';
            reason = 'Пат';
        } else if (this.game.isDraw()) {
            result = 'draw';
            reason = 'Ничья';
        }
        
        if (result) {
            this.sendMessage({ event: 'game_end', gameId: this.gameId, result, reason });
            this.endGame(result, reason);
        }
    }

    endGame(result, reason) {
        this.stopTimer();
        
        const resultEl = document.getElementById('game-result');
        const reasonEl = document.getElementById('game-result-reason');
        
        const resultText = {
            'win': 'Победа!',
            'loss': 'Поражение',
            'draw': 'Ничья'
        };
        
        resultEl.textContent = resultText[result] || 'Игра окончена';
        resultEl.className = result;
        reasonEl.textContent = reason;
        
        this.showScreen('game-over-screen');
    }

    resign() {
        if (confirm('Вы уверены, что хотите сдаться?')) {
            this.sendMessage({ event: 'resign', gameId: this.gameId });
        }
    }

    offerDraw() {
        this.sendMessage({ event: 'offer_draw', gameId: this.gameId });
        this.showNotification('Предложение ничьи отправлено');
    }

    showMainMenu() {
        this.showScreen('main-menu');
        document.getElementById('matchmaking-status').classList.add('hidden');
        document.querySelector('.menu-buttons').classList.remove('hidden');
        
        this.game = new Chess();
        this.gameId = null;
        this.renderBoard();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    updatePlayerInfo() {
        // Update player names and times
        document.getElementById('player-info').querySelector('.player-name').textContent = 
            this.playerColor === 'w' ? 'Вы (Белые)' : 'Вы (Черные)';
        document.getElementById('opponent-info').querySelector('.player-name').textContent = 
            this.playerColor === 'w' ? 'Противник (Черные)' : 'Противник (Белые)';
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.isMyTurn) {
                this.timeLeft[this.playerColor] -= 1000;
            } else {
                this.timeLeft[this.playerColor === 'w' ? 'b' : 'w'] -= 1000;
            }
            this.updateTimers();
            
            // Check timeout
            if (this.timeLeft[this.playerColor] <= 0) {
                this.sendMessage({ event: 'timeout', gameId: this.gameId, color: this.playerColor });
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimers() {
        const formatTime = (ms) => {
            const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const playerTime = this.playerColor === 'w' ? this.timeLeft.w : this.timeLeft.b;
        const opponentTime = this.playerColor === 'w' ? this.timeLeft.b : this.timeLeft.w;

        document.getElementById('player-info').querySelector('.player-time').textContent = formatTime(playerTime);
        document.getElementById('opponent-info').querySelector('.player-time').textContent = formatTime(opponentTime);

        // Highlight low time
        const playerTimeEl = document.getElementById('player-info').querySelector('.player-time');
        playerTimeEl.classList.toggle('low', playerTime < 60000);
    }

    showNotification(message, type = 'info') {
        // Use Telegram's native popup or custom notification
        if (tg.showPopup) {
            tg.showPopup({ title: type === 'error' ? 'Ошибка' : 'Информация', message });
        } else {
            alert(message);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chessApp = new ChessApp();
});

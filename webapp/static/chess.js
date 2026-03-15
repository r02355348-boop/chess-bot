/*
 * chess.js - JavaScript chess engine
 * Modified for Telegram Mini App
 */

class Chess {
    constructor() {
        this.board = [];
        this.turn = 'w';
        this.castling = { w: { k: true, q: true }, b: { k: true, q: true } };
        this.enPassant = null;
        this.halfMoves = 0;
        this.fullMoves = 1;
        this.history = [];
        this.init();
    }

    init() {
        const initial = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
        this.board = initial.map(row => [...row]);
    }

    pieceSymbols = {
        'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙',
        'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟'
    };

    getPieceSymbol(piece) {
        return this.pieceSymbols[piece] || '';
    }

    isWhitePiece(piece) {
        return piece && piece === piece.toUpperCase();
    }

    isBlackPiece(piece) {
        return piece && piece === piece.toLowerCase();
    }

    isOwnPiece(piece, color) {
        return color === 'w' ? this.isWhitePiece(piece) : this.isBlackPiece(piece);
    }

    isOpponentPiece(piece, color) {
        return color === 'w' ? this.isBlackPiece(piece) : this.isWhitePiece(piece);
    }

    inBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || !this.isOwnPiece(piece, this.turn)) return [];

        const type = piece.toLowerCase();
        let moves = [];

        switch (type) {
            case 'p': moves = this.getPawnMoves(row, col, piece); break;
            case 'n': moves = this.getKnightMoves(row, col, piece); break;
            case 'b': moves = this.getBishopMoves(row, col, piece); break;
            case 'r': moves = this.getRookMoves(row, col, piece); break;
            case 'q': moves = this.getQueenMoves(row, col, piece); break;
            case 'k': moves = this.getKingMoves(row, col, piece); break;
        }

        // Filter moves that leave king in check
        return moves.filter(move => {
            const testBoard = this.clone();
            testBoard.makeMove(move);
            return !testBoard.isInCheck(this.turn);
        });
    }

    getPawnMoves(row, col, piece) {
        const moves = [];
        const color = this.isWhitePiece(piece) ? 'w' : 'b';
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        const promotionRow = color === 'w' ? 0 : 7;

        // Forward move
        if (this.inBounds(row + direction, col) && !this.board[row + direction][col]) {
            this.addPawnMove(moves, row, col, row + direction, col, row + direction === promotionRow);
            
            // Double move from start
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ from: { row, col }, to: { row: row + 2 * direction, col }, piece });
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (this.inBounds(row + direction, newCol)) {
                const target = this.board[row + direction][newCol];
                if (target && this.isOpponentPiece(target, color)) {
                    this.addPawnMove(moves, row, col, row + direction, newCol, row + direction === promotionRow, target);
                }
                // En passant
                if (this.enPassant && this.enPassant.row === row + direction && this.enPassant.col === newCol) {
                    moves.push({ from: { row, col }, to: { row: row + direction, col: newCol }, piece, enPassant: true });
                }
            }
        }

        return moves;
    }

    addPawnMove(moves, fromRow, fromCol, toRow, toCol, isPromotion, capture = null) {
        if (isPromotion) {
            for (const promo of ['q', 'r', 'b', 'n']) {
                moves.push({
                    from: { row: fromRow, col: fromCol },
                    to: { row: toRow, col: toCol },
                    piece: this.board[fromRow][fromCol],
                    promotion: promo,
                    capture
                });
            }
        } else {
            moves.push({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece: this.board[fromRow][fromCol], capture });
        }
    }

    getKnightMoves(row, col, piece) {
        const moves = [];
        const deltas = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        
        for (const [dr, dc] of deltas) {
            const newRow = row + dr, newCol = col + dc;
            if (this.inBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.isOpponentPiece(target, this.turn)) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, piece, capture: target });
                }
            }
        }
        return moves;
    }

    getSlidingMoves(row, col, piece, directions) {
        const moves = [];
        for (const [dr, dc] of directions) {
            let newRow = row + dr, newCol = col + dc;
            while (this.inBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, piece });
                } else {
                    if (this.isOpponentPiece(target, this.turn)) {
                        moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, piece, capture: target });
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }
        return moves;
    }

    getBishopMoves(row, col, piece) {
        return this.getSlidingMoves(row, col, piece, [[-1,-1], [-1,1], [1,-1], [1,1]]);
    }

    getRookMoves(row, col, piece) {
        return this.getSlidingMoves(row, col, piece, [[-1,0], [1,0], [0,-1], [0,1]]);
    }

    getQueenMoves(row, col, piece) {
        return [...this.getBishopMoves(row, col, piece), ...this.getRookMoves(row, col, piece)];
    }

    getKingMoves(row, col, piece) {
        const moves = [];
        const deltas = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        
        for (const [dr, dc] of deltas) {
            const newRow = row + dr, newCol = col + dc;
            if (this.inBounds(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.isOpponentPiece(target, this.turn)) {
                    moves.push({ from: { row, col }, to: { row: newRow, col: newCol }, piece, capture: target });
                }
            }
        }

        // Castling
        const color = this.isWhitePiece(piece) ? 'w' : 'b';
        const backRank = color === 'w' ? 7 : 0;
        if (row === backRank && col === 4) {
            // Kingside
            if (this.castling[color].k && !this.board[backRank][5] && !this.board[backRank][6]) {
                if (!this.isSquareAttacked(backRank, 4, color) && 
                    !this.isSquareAttacked(backRank, 5, color)) {
                    moves.push({ from: { row, col }, to: { row: backRank, col: 6 }, piece, castling: 'k' });
                }
            }
            // Queenside
            if (this.castling[color].q && !this.board[backRank][1] && !this.board[backRank][2] && !this.board[backRank][3]) {
                if (!this.isSquareAttacked(backRank, 4, color) && 
                    !this.isSquareAttacked(backRank, 3, color)) {
                    moves.push({ from: { row, col }, to: { row: backRank, col: 2 }, piece, castling: 'q' });
                }
            }
        }

        return moves;
    }

    isSquareAttacked(row, col, byColor) {
        // Check pawn attacks
        const pawnDir = byColor === 'w' ? 1 : -1;
        for (const dc of [-1, 1]) {
            const newRow = row + pawnDir, newCol = col + dc;
            if (this.inBounds(newRow, newCol)) {
                const piece = this.board[newRow][newCol];
                if (piece && piece.toLowerCase() === 'p' && this.isOwnPiece(piece, byColor)) {
                    return true;
                }
            }
        }

        // Check knight attacks
        const knightDeltas = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        for (const [dr, dc] of knightDeltas) {
            const newRow = row + dr, newCol = col + dc;
            if (this.inBounds(newRow, newCol)) {
                const piece = this.board[newRow][newCol];
                if (piece && piece.toLowerCase() === 'n' && this.isOwnPiece(piece, byColor)) {
                    return true;
                }
            }
        }

        // Check sliding attacks (bishop/queen/rook)
        const bishopDirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
        for (const [dr, dc] of bishopDirs) {
            let newRow = row + dr, newCol = col + dc;
            while (this.inBounds(newRow, newCol)) {
                const piece = this.board[newRow][newCol];
                if (piece) {
                    if (this.isOwnPiece(piece, byColor) && 
                        (piece.toLowerCase() === 'b' || piece.toLowerCase() === 'q')) {
                        return true;
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        const rookDirs = [[-1,0], [1,0], [0,-1], [0,1]];
        for (const [dr, dc] of rookDirs) {
            let newRow = row + dr, newCol = col + dc;
            while (this.inBounds(newRow, newCol)) {
                const piece = this.board[newRow][newCol];
                if (piece) {
                    if (this.isOwnPiece(piece, byColor) && 
                        (piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q')) {
                        return true;
                    }
                    break;
                }
                newRow += dr;
                newCol += dc;
            }
        }

        // Check king attacks
        const kingDeltas = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
        for (const [dr, dc] of kingDeltas) {
            const newRow = row + dr, newCol = col + dc;
            if (this.inBounds(newRow, newCol)) {
                const piece = this.board[newRow][newCol];
                if (piece && piece.toLowerCase() === 'k' && this.isOwnPiece(piece, byColor)) {
                    return true;
                }
            }
        }

        return false;
    }

    findKing(color) {
        const kingPiece = color === 'w' ? 'K' : 'k';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === kingPiece) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;
        return this.isSquareAttacked(king.row, king.col, color === 'w' ? 'b' : 'w');
    }

    makeMove(move) {
        const { from, to, piece, promotion, capture, enPassant, castling } = move;
        
        // Save state for undo
        this.history.push({
            board: this.board.map(row => [...row]),
            turn: this.turn,
            castling: JSON.parse(JSON.stringify(this.castling)),
            enPassant: this.enPassant,
            halfMoves: this.halfMoves,
            fullMoves: this.fullMoves
        });

        // Update board
        this.board[to.row][to.col] = promotion ? 
            (this.isWhitePiece(piece) ? promotion.toUpperCase() : promotion.toLowerCase()) : 
            piece;
        this.board[from.row][from.col] = null;

        // Handle en passant capture
        if (enPassant) {
            const captureRow = this.isWhitePiece(piece) ? to.row + 1 : to.row - 1;
            this.board[captureRow][to.col] = null;
        }

        // Handle castling - move rook
        if (castling) {
            const backRank = this.isWhitePiece(piece) ? 7 : 0;
            if (castling === 'k') {
                this.board[backRank][5] = this.board[backRank][7];
                this.board[backRank][7] = null;
            } else {
                this.board[backRank][3] = this.board[backRank][0];
                this.board[backRank][0] = null;
            }
        }

        // Update castling rights
        const color = this.isWhitePiece(piece) ? 'w' : 'b';
        if (piece.toLowerCase() === 'k') {
            this.castling[color].k = false;
            this.castling[color].q = false;
        } else if (piece.toLowerCase() === 'r') {
            if (from.col === 0) this.castling[color].q = false;
            if (from.col === 7) this.castling[color].k = false;
        }

        // Set en passant square
        if (piece.toLowerCase() === 'p' && Math.abs(to.row - from.row) === 2) {
            this.enPassant = {
                row: (from.row + to.row) / 2,
                col: from.col
            };
        } else {
            this.enPassant = null;
        }

        // Update move counters
        if (piece.toLowerCase() === 'p' || capture) {
            this.halfMoves = 0;
        } else {
            this.halfMoves++;
        }

        if (this.turn === 'b') {
            this.fullMoves++;
        }

        this.turn = this.turn === 'w' ? 'b' : 'w';
    }

    undoMove() {
        if (this.history.length === 0) return false;
        const state = this.history.pop();
        this.board = state.board;
        this.turn = state.turn;
        this.castling = state.castling;
        this.enPassant = state.enPassant;
        this.halfMoves = state.halfMoves;
        this.fullMoves = state.fullMoves;
        return true;
    }

    isCheckmate() {
        if (!this.isInCheck(this.turn)) return false;
        return this.getAllValidMoves().length === 0;
    }

    isStalemate() {
        if (this.isInCheck(this.turn)) return false;
        return this.getAllValidMoves().length === 0;
    }

    isDraw() {
        // 50 move rule
        if (this.halfMoves >= 100) return true;
        
        // Insufficient material
        const pieces = { w: [], b: [] };
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const color = this.isWhitePiece(piece) ? 'w' : 'b';
                    pieces[color].push(piece.toLowerCase());
                }
            }
        }
        
        // King vs King
        if (pieces.w.length === 1 && pieces.b.length === 1) return true;
        
        // King and minor piece vs King - fixed parentheses
        if ((pieces.w.length === 1 && pieces.b.length === 2 && (pieces.b.includes('n') || pieces.b.includes('b'))) ||
            (pieces.b.length === 1 && pieces.w.length === 2 && (pieces.w.includes('n') || pieces.w.includes('b')))) {
            return true;
        }

        return false;
    }

    getAllValidMoves() {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] && this.isOwnPiece(this.board[row][col], this.turn)) {
                    moves.push(...this.getMoves(row, col));
                }
            }
        }
        return moves;
    }

    clone() {
        const newChess = new Chess();
        newChess.board = this.board.map(row => [...row]);
        newChess.turn = this.turn;
        newChess.castling = JSON.parse(JSON.stringify(this.castling));
        newChess.enPassant = this.enPassant;
        newChess.halfMoves = this.halfMoves;
        newChess.fullMoves = this.fullMoves;
        return newChess;
    }

    fen() {
        let fen = '';
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }
        
        fen += ' ' + this.turn;
        
        let castling = '';
        if (this.castling.w.k) castling += 'K';
        if (this.castling.w.q) castling += 'Q';
        if (this.castling.b.k) castling += 'k';
        if (this.castling.b.q) castling += 'q';
        fen += ' ' + (castling || '-');
        
        fen += ' ' + (this.enPassant ? 
            String.fromCharCode(97 + this.enPassant.col) + (8 - this.enPassant.row) : '-');
        
        fen += ' ' + this.halfMoves;
        fen += ' ' + this.fullMoves;
        
        return fen;
    }
}

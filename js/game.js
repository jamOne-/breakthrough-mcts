define(["require", "exports", './player', './pawn'], function (require, exports, player_1, pawn_1) {
    "use strict";
    var GameState;
    (function (GameState) {
        GameState[GameState["RUNNING"] = 0] = "RUNNING";
        GameState[GameState["END"] = 1] = "END";
    })(GameState || (GameState = {}));
    var Game = (function () {
        function Game(boardSize, player1Type, player2Type) {
            this.boardSize = boardSize;
            this.restart.apply(this, arguments);
        }
        Game.prototype.restart = function (boardSize, player1Type, player2Type) {
            this._clickListeners = [];
            this._drawListeners = [];
            this.turn = 0;
            this.gameState = GameState.RUNNING;
            this.board = new Array(this.boardSize);
            for (var i = 0; i < this.boardSize; i++)
                this.board[i] = new Array(this.boardSize);
            for (var y = 0; y < 2; y++)
                for (var x = 0; x < this.boardSize; x++)
                    this.board[y][x] = new pawn_1.Pawn({ x: x, y: y }, 1);
            for (var y = this.boardSize - 2; y < this.boardSize; y++)
                for (var x = 0; x < this.boardSize; x++)
                    this.board[y][x] = new pawn_1.Pawn({ x: x, y: y }, 0);
            this.players = [
                player_1.PlayerFactory.create(player1Type, this, 0),
                player_1.PlayerFactory.create(player2Type, this, 1)
            ];
        };
        Game.prototype.run = function () {
            this.callDrawListeners();
            this.players[0].move();
        };
        Game.prototype.moved = function () {
            this.callDrawListeners();
            var end = this.checkEnd();
            if (end == -1) {
                this.turn = (this.turn + 1) % 2;
                this.players[this.turn].move();
                return;
            }
            console.info(end + ' wygral');
            this.gameState = GameState.END;
        };
        Game.prototype.checkEnd = function () {
            if (this.board[0].some(function (p) { return p && p.color === 0; }))
                return 0;
            if (this.board[this.boardSize - 1].some(function (p) { return p && p.color === 1; }))
                return 1;
            return -1;
        };
        Game.prototype.addClickListener = function (f) {
            this._clickListeners.push(f);
        };
        Game.prototype.addDrawListener = function (f) {
            this._drawListeners.push(f);
        };
        Game.prototype.handleClick = function (position) {
            this._clickListeners.forEach(function (f) { return f(position); });
        };
        Game.prototype.callDrawListeners = function () {
            this._drawListeners.forEach(function (f) { return f(); });
        };
        Game.prototype.getPawns = function (color) {
            return this.board.reduce(function (ret, row) {
                return ret.concat(row.filter(function (pawn) { return pawn && pawn.color === color; }));
            }).filter(function (pawn) { return !!pawn; });
        };
        Game.prototype.getPossibleMovesOfAPawn = function (pawn) {
            if (!pawn)
                return [];
            var possibleMoves = [];
            var deltay = pawn.color ? 1 : -1;
            for (var deltax = -1; deltax <= 1; deltax++) {
                var x = pawn.position.x + deltax;
                var y = pawn.position.y + deltay;
                if (x >= 0 && x < this.boardSize &&
                    y >= 0 && y < this.boardSize &&
                    (!this.board[y][x] || (deltax !== 0 && this.board[y][x].color !== pawn.color)))
                    possibleMoves.push({ x: x, y: y });
            }
            return possibleMoves;
        };
        Game.prototype.movePawn = function (pawn, position) {
            this.board[pawn.position.y][pawn.position.x] = undefined;
            pawn.position = position;
            this.board[position.y][position.x] = pawn;
        };
        Game.prototype.getPawn = function (position) {
            return this.board[position.y][position.x];
        };
        return Game;
    }());
    exports.Game = Game;
});
//# sourceMappingURL=game.js.map
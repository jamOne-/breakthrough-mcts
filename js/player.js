var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    // import {HumanPlayer} from './player-human';
    // import {RandomPlayer} from './player-random';
    var Player = (function () {
        function Player(game, color) {
            this.game = game;
            this.color = color;
        }
        return Player;
    }());
    exports.Player = Player;
    var PlayerFactory = (function () {
        function PlayerFactory() {
        }
        PlayerFactory.create = function (type, game, color) {
            switch (type) {
                case 'random':
                    return new RandomPlayer(game, color);
                case 'human':
                default:
                    return new HumanPlayer(game, color);
            }
        };
        return PlayerFactory;
    }());
    exports.PlayerFactory = PlayerFactory;
    // ***********************************************************************
    var HumanPlayer = (function (_super) {
        __extends(HumanPlayer, _super);
        function HumanPlayer(game, color) {
            _super.call(this, game, color);
            this.game = game;
            this.color = color;
            this._movePermitted = false;
            game.addClickListener(this._handleClick.bind(this));
        }
        HumanPlayer.prototype.move = function () {
            this._movePermitted = true;
        };
        HumanPlayer.prototype._handleClick = function (position) {
            if (!this._movePermitted)
                return;
            if (!this.selectedPawn)
                this._selectPawn(position);
            else
                this._movePawn(position);
        };
        HumanPlayer.prototype._selectPawn = function (position) {
            var clickedPawn = this.game.getPawn(position);
            this.selectedPawn = clickedPawn && clickedPawn.color === this.color && clickedPawn || null;
            this.game.callDrawListeners();
        };
        HumanPlayer.prototype._movePawn = function (position) {
            var possibleMoves = this.game.getPossibleMovesOfAPawn(this.selectedPawn);
            if (possibleMoves.some(function (p) { return p.x === position.x && p.y === position.y; })) {
                this.game.movePawn(this.selectedPawn, position);
                this._movePermitted = false;
                this.selectedPawn = null;
                this.game.moved();
                return;
            }
            if (this.game.getPawn(position) != this.selectedPawn)
                this._selectPawn(position);
            else
                this.selectedPawn = null;
            this.game.callDrawListeners();
        };
        return HumanPlayer;
    }(Player));
    exports.HumanPlayer = HumanPlayer;
    // ***********************************************************************
    var RandomPlayer = (function (_super) {
        __extends(RandomPlayer, _super);
        function RandomPlayer() {
            _super.apply(this, arguments);
        }
        RandomPlayer.prototype.move = function () {
            var pawns = this.game.getPawns(this.color);
            while (true) {
                var pawn = pawns[Math.floor(Math.random() * pawns.length)];
                var possibleMoves = this.game.getPossibleMovesOfAPawn(pawn);
                if (possibleMoves.length > 0) {
                    var newPosition = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    this.game.movePawn(pawn, newPosition);
                    this.game.moved();
                    break;
                }
            }
        };
        return RandomPlayer;
    }(Player));
    exports.RandomPlayer = RandomPlayer;
});
//# sourceMappingURL=player.js.map
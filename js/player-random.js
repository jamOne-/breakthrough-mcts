var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './player'], function (require, exports, player_1) {
    "use strict";
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
    }(player_1.Player));
    exports.RandomPlayer = RandomPlayer;
});
//# sourceMappingURL=player-random.js.map
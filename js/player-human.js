var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './player'], function (require, exports, player_1) {
    "use strict";
    var HumanPlayer = (function (_super) {
        __extends(HumanPlayer, _super);
        function HumanPlayer(game, color) {
            _super.call(this, game, color);
            this.game = game;
            this.color = color;
            this._selectedPawn = null;
            this._movePermitted = false;
            game.addClickListener(this._handleClick.bind(this));
        }
        HumanPlayer.prototype.move = function () {
            this._movePermitted = true;
        };
        HumanPlayer.prototype._handleClick = function (position) {
            if (!this._movePermitted)
                return;
            if (!this._selectedPawn)
                this._selectPawn(position);
            else
                this._movePawn(position);
        };
        HumanPlayer.prototype._selectPawn = function (position) {
            var clickedPawn = this.game.getPawn(position);
            this._selectedPawn = clickedPawn && clickedPawn.color === this.color && clickedPawn || null;
        };
        HumanPlayer.prototype._movePawn = function (position) {
            var possibleMoves = this.game.getPossibleMovesOfAPawn(this._selectedPawn);
            if (possibleMoves.some(function (p) { return p.x === position.x && p.y === position.y; })) {
                this.game.movePawn(this._selectedPawn, position);
                this._movePermitted = false;
                this._selectedPawn = null;
                this.game.moved();
            }
            else if (this.game.getPawn(position) != this._selectedPawn &&
                this.game.getPawn(position).color === this.color)
                this._selectedPawn = this.game.getPawn(position);
            else
                this._selectedPawn = null;
        };
        return HumanPlayer;
    }(player_1.Player));
    exports.HumanPlayer = HumanPlayer;
});
//# sourceMappingURL=player-human.js.map
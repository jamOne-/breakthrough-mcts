import {Player} from './player';

export class RandomPlayer extends Player {
    public move() {
        let moves = this.board.getPossibleMovesOfPawns(this.color);
        let move = moves[~~(Math.random() * moves.length)];
        
        this.board.movePawn(move.pawn, move.point);
        this._onMove();
    }
}
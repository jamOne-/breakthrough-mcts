import {Player} from './player';

export class RandomPlayer extends Player {
    public move() {
        let pawns = this.game.getPawns(this.color);

        while (true) {
            let pawn = pawns[Math.floor(Math.random() * pawns.length)];
            let possibleMoves = this.game.getPossibleMovesOfAPawn(pawn);
            
            if (possibleMoves.length > 0) {
                let newPosition = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.game.movePawn(pawn, newPosition);                
                this.game.moved();
                break;
            }
        }
    }
}
import {Player} from './player';
import {Pawn} from './pawn';
import {Point} from './point';

export class MinMaxPlayer extends Player {
    public move() {
        let moves = this._negamax(4, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        let move = moves[Math.floor(Math.random() * moves.length)];

        this.board.movePawn(move.pawn, move.move);
        this._onMove();
    }
    
    private _orderPawns(pawns: Pawn[]) {
        let pawnDistance = (pawn : Pawn) => {
            if (pawn.color) return pawn.position.y + 1;
            return this.board.boardSize - pawn.position.y;
        }
        
        pawns.sort((a, b) => pawnDistance(b) - pawnDistance(a));
        return pawns;
    }
    
    private _negamax(depth : number, a : number, b : number) {
        if (depth === 0) return [{ value: this.board.calculateValue(), move: null, pawn: null }];
        
        let maxMoves = [{ pawn: null, move: null, value: Number.NEGATIVE_INFINITY }];
        this._orderPawns(this.board.getPawns(this.board.turn)).every(pawn => {
            return this.board.getPossibleMovesOfAPawn(pawn).every(move => {
                let previousPawn = this.board.getPawn(move);
                let previousPosition : Point = JSON.parse(JSON.stringify(pawn.position));
                let value = 0;
                
                this.board.movePawn(pawn, move);
                this.board.nextTurn();
                
                if (this.board.checkEnd() === -1)
                    value = - this._negamax(depth - 1, -b, -a)[0].value;
                else
                    value = 9999999 - this.board.turnNumber;
                            
                this.board.previousTurn();
                this.board.movePawn(pawn, previousPosition);
                if (previousPawn) this.board.movePawn(previousPawn, previousPawn.position);
                
                if (value === maxMoves[0].value)
                    maxMoves.push({ move, pawn, value });
                else if (value > maxMoves[0].value)
                    maxMoves = [{ move, pawn, value }];
                    
                a = Math.max(a, value);
                
                return a < b;
            });
        });
        
        return maxMoves;
    }
}
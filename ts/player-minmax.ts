import {Player} from './player';
import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';

export class MinMaxPlayer extends Player {
    public constructor(board : Board,
                       color : number,
                       _onMove : (() => void),
                       private _valueFunction : ((board : Board) => number)) {
        super(board, color, _onMove);
    }
    
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
        if (depth === 0) return [{ value: this._valueFunction(this.board), move: null, pawn: null }];
        
        let maxMoves = [{ pawn: null, move: null, value: Number.NEGATIVE_INFINITY }];
        this._orderPawns(this.board.getPawns(this.board.turn)).every(pawn => {
            return this.board.getPossibleMovesOfAPawn(pawn).every(move => {
                let previousPawn = this.board.getPawn(move);
                let previousPosition : Point = JSON.parse(JSON.stringify(pawn.position));
                let value = 0;
                
                this.board.movePawn(pawn, move);
                
                if (this.board.checkEnd() === -1)
                    value = - this._negamax(depth - 1, -b, -a)[0].value;
                else
                    value = 9999999 - this.board.turnNumber;
                            
                this.board.undoMove();
                
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

export function valueFunction(board : Board) {
        let pawnDistance = (pawn : Pawn) => {
            if (pawn.color) return pawn.position.y + 1;
            return board.boardSize - pawn.position.y;
        }
        
        let playerColor = board.turn;
        
        let enemyColor = ((playerColor + 1)) & 1;
        let endingPosition = board.checkEnd();
        
        if (endingPosition === playerColor) return 9999999 - board.turnNumber;
        else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
        
        let myPawns = board.getPawns(playerColor);
        let enemyPawns = board.getPawns(enemyColor);
        
        let mySortedDistances = myPawns.map(p => pawnDistance(p)).sort((a, b) => b - a);
        let enemySortedDistances = enemyPawns.map(p => pawnDistance(p)).sort((a, b) => b - a);
        
        let i = 1;
        let myValue = mySortedDistances.reduce((val, a) => { i /= 2; return val + a * i; }) + 3 * myPawns.length;
        
        i = 1
        let enemyValue = enemySortedDistances.reduce((val, a) => { i /= 2; return val + a * i; }) + 3 * enemyPawns.length;
        
        return myValue - enemyValue;
}

export function valueFunction2(board : Board) {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    let playerColor = board.turn;
    
    let enemyColor = ((playerColor + 1)) & 1;
    let endingPosition = board.checkEnd();
    
    if (endingPosition === playerColor) return 9999999 - board.turnNumber;
    else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
    
    let myPawns = board.getPawns(playerColor);
    let enemyPawns = board.getPawns(enemyColor);
    let myValue = myPawns.reduce((max, pawn) => Math.max(max, pawnDistance(pawn)), 0) + myPawns.length;
    let enemyValue = enemyPawns.reduce((max, pawn) => Math.max(max, pawnDistance(pawn)), 0) + enemyPawns.length;
    
    return myValue - enemyValue;
}

export function valueFunction3(board : Board) {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    let playerColor = board.turn;
    
    let enemyColor = ((playerColor + 1)) & 1;
    let endingPosition = board.checkEnd();
    
    if (endingPosition === playerColor) return 9999999 - board.turnNumber;
    else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
    
    let myPawns = board.getPawns(playerColor);
    let enemyPawns = board.getPawns(enemyColor);
    let myValue = myPawns.reduce((val, pawn) => val * pawnDistance(pawn), 1);
    let enemyValue = enemyPawns.reduce((val, pawn) => val * pawnDistance(pawn), 1);
    
    return myValue - enemyValue;
}
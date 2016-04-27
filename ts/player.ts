import {Game} from './game';
import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';

export abstract class Player {
    public selectedPawn : Pawn;
    public abstract move();

    public constructor(public board : Board,
                       public color : number,
                       public _onMove : (() => void)) {}            // todo: public?
}

export class PlayerFactory {
    public static create(type : string,
                         board : Board,
                         color : number,
                         onMove : (() => void),
                         addClickListener,              // todo: otypować
                         callDrawListeners) {
        switch (type) {
            case 'random':
                return new RandomPlayer(board, color, onMove);
                
            case 'minmax':
                return new MinMaxPlayer(board, color, onMove);
        
            case 'human':
            default:
                return new HumanPlayer(board, color, onMove, addClickListener, callDrawListeners);
        }
    }
}

// ***********************************************************************

export class HumanPlayer extends Player {
    private _movePermitted : boolean;
    
    public constructor(public board : Board,
                       public color : number,
                       public _onMove : (() => void),
                       addClickListener,
                       private _callDrawListeners) {
        super(board, color, _onMove);
        
        this._movePermitted = false;
        addClickListener(this._handleClick.bind(this));
    }
    
    public move() {
        this._movePermitted = true;
    }
    
    private _handleClick(position : Point) {
        if (!this._movePermitted) return;
        
        if (!this.selectedPawn) this._selectPawn(position);
        else this._movePawn(position);
    }
    
    private _selectPawn(position : Point) {
        let clickedPawn = this.board.getPawn(position);
        this.selectedPawn = clickedPawn && clickedPawn.color === this.color && clickedPawn || null;
        this._callDrawListeners();
    }
    
    private _movePawn(position : Point) {
        let possibleMoves = this.board.getPossibleMovesOfAPawn(this.selectedPawn);
        if (possibleMoves.some(p => p.x === position.x && p.y === position.y)) {
            this.board.movePawn(this.selectedPawn, position);
            this._movePermitted = false;
            this.selectedPawn = null;
            this._onMove();
            return;
        }
        
        if (this.board.getPawn(position) != this.selectedPawn)   this._selectPawn(position);            
        else                                                     this.selectedPawn = null;
        this._callDrawListeners();
    }
}

// ***********************************************************************

export class RandomPlayer extends Player {
    public move() {
        let pawns = this.board.getPawns(this.color);

        while (true) {
            let pawn = pawns[Math.floor(Math.random() * pawns.length)];
            let possibleMoves = this.board.getPossibleMovesOfAPawn(pawn);
            
            if (possibleMoves.length > 0) {
                let newPosition = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.board.movePawn(pawn, newPosition);                
                this._onMove();
                break;
            }
        }
    }
}

// ***********************************************************************

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
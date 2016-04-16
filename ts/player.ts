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
        else                                                    this.selectedPawn = null;
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
        let move = this._minimax(this.board, 3, true, {});
        
        this.board.movePawn(move.pawn, move.move);
        this._onMove();
    }
    
    /*
    01 function minimax(node, depth, maximizingPlayer)
02     if depth = 0 or node is a terminal node
03         return the heuristic value of node

04     if maximizingPlayer
05         bestValue := −∞
06         for each child of node
07             v := minimax(child, depth − 1, FALSE)
08             bestValue := max(bestValue, v)
09         return bestValue

10     else    (* minimizing player *)
11         bestValue := +∞
12         for each child of node
13             v := minimax(child, depth − 1, TRUE)
14             bestValue := min(bestValue, v)
15         return bestValue
    */
    
    private _minimax(board : Board, depth : number, maximizingPlayer : boolean, lastMove : any) {
        if (depth === 0) return { value: board.calculateValue(), move: lastMove.move, pawn: lastMove.pawn };
        
        let possibleMoves : { pawn : Pawn, move : Point, value : number }[] = [];
        board.getPawns(board.turn).forEach(pawn => {
            board.getPossibleMovesOfAPawn(pawn).forEach(move => {
                possibleMoves.push({
                    pawn,
                    move,
                    value: 0
                });
            });
        });
        
        if (maximizingPlayer) {
            possibleMoves.forEach(move => {
                let previousPawn = board.getPawn(move.move);
                let previousPosition = JSON.parse(JSON.stringify(move.pawn.position));
                
                board.movePawn(move.pawn, move.move);
                // board.nextTurn();
                move.value = this._minimax(board, depth - 1, false, move).value;
                board.movePawn(move.pawn, previousPosition);
                if (previousPawn) board.movePawn(previousPawn, previousPawn.position);
                // board.nextTurn();
            });
            
            return possibleMoves.reduce((max, move) => move.value > max.value ? move : max);            
        }
        
        else {
            possibleMoves.forEach(move => {
                let previousPawn = board.getPawn(move.move);
                let previousPosition = JSON.parse(JSON.stringify(move.pawn.position));
                
                board.movePawn(move.pawn, move.move);
                // board.nextTurn();
                move.value = this._minimax(board, depth - 1, true, move).value;
                board.movePawn(move.pawn, previousPosition);
                if (previousPawn) board.movePawn(previousPawn, previousPawn.position);
                // board.nextTurn();
            });
            
            return possibleMoves.reduce((min, move) => move.value < min.value ? move : min);            
        }
    }
}
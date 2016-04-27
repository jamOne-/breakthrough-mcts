import {Player} from './player';
import {Board} from './board';
import {Point} from './point';

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
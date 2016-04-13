import {Player} from './player';
import {Pawn} from './pawn';
import {Game} from './game';
import {Point} from './point';

export class HumanPlayer extends Player {
    private _movePermitted : boolean;
    private _selectedPawn : Pawn;
    
    public constructor(public game : Game, public color : number) {
        super(game, color);
        
        this._selectedPawn = null;
        this._movePermitted = false;
        game.addClickListener(this._handleClick.bind(this));
    }
    
    public move() {
        this._movePermitted = true;
    }
    
    private _handleClick(position : Point) {
        if (!this._movePermitted) return;
        
        if (!this._selectedPawn) this._selectPawn(position);
        else this._movePawn(position);
    }
    
    private _selectPawn(position : Point) {
        let clickedPawn = this.game.getPawn(position);
        this._selectedPawn = clickedPawn && clickedPawn.color === this.color && clickedPawn || null;
    }
    
    private _movePawn(position : Point) {
        let possibleMoves = this.game.getPossibleMovesOfAPawn(this._selectedPawn);
        if (possibleMoves.some(p => p.x === position.x && p.y === position.y)) {
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
    }
}
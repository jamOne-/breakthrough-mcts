import {Game} from './game';
import {Pawn} from './pawn';
import {Point} from './point';
// import {HumanPlayer} from './player-human';
// import {RandomPlayer} from './player-random';

export abstract class Player {
    public selectedPawn : Pawn;
    public abstract move();

    public constructor(public game : Game, public color : number) {}
}

export class PlayerFactory {
    public static create(type : string, game : Game, color : number) {
        switch (type) {
            case 'random':
                return new RandomPlayer(game, color);
        
            case 'human':
            default:
                return new HumanPlayer(game, color);
        }
    }
}

// ***********************************************************************

export class HumanPlayer extends Player {
    private _movePermitted : boolean;
    
    public constructor(public game : Game, public color : number) {
        super(game, color);
        
        this._movePermitted = false;
        game.addClickListener(this._handleClick.bind(this));
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
        let clickedPawn = this.game.getPawn(position);
        this.selectedPawn = clickedPawn && clickedPawn.color === this.color && clickedPawn || null;
        this.game.callDrawListeners();
    }
    
    private _movePawn(position : Point) {
        let possibleMoves = this.game.getPossibleMovesOfAPawn(this.selectedPawn);
        if (possibleMoves.some(p => p.x === position.x && p.y === position.y)) {
            this.game.movePawn(this.selectedPawn, position);
            this._movePermitted = false;
            this.selectedPawn = null;
            this.game.moved();
            return;
        }
        
        if (this.game.getPawn(position) != this.selectedPawn)   this._selectPawn(position);            
        else                                                    this.selectedPawn = null;
        this.game.callDrawListeners();
    }
}

// ***********************************************************************

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
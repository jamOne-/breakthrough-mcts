import {Player} from './player';
import {PlayerFactory} from './player-factory';
import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';

enum GameState {
    RUNNING,
    END
}

export class Game {
    private _clickListeners : ((position : Point) => any)[];
    private _drawListeners : (() => void)[];
    private _endListeners: ((winner : number) => void)[];

    public players : Player[];
    public gameState : GameState;
    public board : Board;

    public constructor(public boardSize : number,
                    public async : boolean,
                    player1Type : string,
                    player2Type : string) {
        this.restart.apply(this, arguments);
    }

    public restart(boardSize : number, async : boolean, player1Type: string, player2Type : string) {
        this._clickListeners = [];
        this._drawListeners = [];
        this._endListeners = [];
        this.gameState = GameState.RUNNING;

        this.board = new Board(boardSize);
        this.board.initBoard();

        this.players = [
            PlayerFactory.create(player1Type, this.board, 0, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this)),
            PlayerFactory.create(player2Type, this.board, 1, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this))
        ];
    }
    
    public stop() {
        this._clickListeners = [];
        this._drawListeners = [];
        this.gameState = GameState.END;
    }
    
    public run() {
        this.callDrawListeners();
        this.players[0].move();
    }

    public moved() {
        if (this.gameState == GameState.END) return;
        
        this.callDrawListeners();
        let end = this.board.checkEnd();

        if (end == -1) {
            this.board.nextTurn();
            if (this.async) setTimeout(() => this.players[this.board.turn].move(), 0);
            else this.players[this.board.turn].move();
            return;
        }

        this.gameState = GameState.END;
        this.callEndListeners(end);
    }

    public addClickListener(f : (position : Point) => any) {
        this._clickListeners.push(f);
    }
    
    public callClickListeners(position : Point) {
        this._clickListeners.forEach(f => f(position));
    }
    
    public addDrawListener(f : () => void) {
        this._drawListeners.push(f);
    }
    
    public callDrawListeners() {
        this._drawListeners.forEach(f => f());
    }
    
    public addEndListener(f : (winner : number) => void) {
        this._endListeners.push(f);
    }
    
    public callEndListeners(winner : number) {
        this._endListeners.forEach(f => f(winner));
    }
}
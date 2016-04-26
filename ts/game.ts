import {Player, PlayerFactory} from './player';
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

    public players : Player[];
    public gameState : GameState;
    public board : Board;

    public constructor(public boardSize : number,
                    player1Type : string,
                    player2Type : string) {
        this.restart.apply(this, arguments);
    }

    public restart(boardSize : number, player1Type: string, player2Type : string) {
        this._clickListeners = [];
        this._drawListeners = [];
        this.gameState = GameState.RUNNING;

        this.board = new Board(boardSize);
        this.board.initBoard();

        this.players = [
            PlayerFactory.create(player1Type, this.board, 0, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this)),
            PlayerFactory.create(player2Type, this.board, 1, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this))
        ];
    }
    
    public run() {
        this.callDrawListeners();
        this.players[0].move();
    }

    public moved() {
        console.log(this.board.calculateValue());
        this.callDrawListeners();
        let end = this.board.checkEnd();

        if (end == -1) {
            this.board.nextTurn();
            setTimeout(() => this.players[this.board.turn].move(), 100);
            return;
        }

        console.info(end + ' wygral');
        this.gameState = GameState.END;
    }

    public addClickListener(f : ((position : Point) => any)) {
        this._clickListeners.push(f);
    }
    
    public addDrawListener(f : (() => void)) {
        this._drawListeners.push(f);
    }

    public handleClick(position : Point) {
        this._clickListeners.forEach(f => f(position));
    }
    
    public callDrawListeners() {
        this._drawListeners.forEach(f => f());
    }
}
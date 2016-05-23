import {Player} from './player';
import {PlayerFactory} from './player-factory';
import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';
import {getWorker} from './player-worker-factory';

enum GameState {
    RUNNING,
    END
}

export class Game {
    private _clickListeners : ((position : Point) => any)[];
    private _drawListeners : (() => void)[];
    private _endListeners: ((winner : number) => void)[];

    public mctsWorker : Worker;
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
        this._endListeners = [];
        this.gameState = GameState.RUNNING;

        this.board = new Board(boardSize);
        this.board.initBoard();

        this.players = [
            PlayerFactory.create(player1Type, this.board, 0, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this)),
            // PlayerFactory.create(player2Type, this.board, 1, this.moved.bind(this), this.addClickListener.bind(this), this.callDrawListeners.bind(this))
        ];
        
        this.mctsWorker = getWorker('mcts');
        this.mctsWorker.postMessage({ type: 'asdf' });
        
        this.mctsWorker.postMessage({
            type: 'color',
            color: 1
        });
        
        this.mctsWorker.onmessage = (ev : MessageEvent) => {
            this.board.movePawn(this.board.getPawn(ev.data.positionBefore), ev.data.positionAfter);
            this.moved();
        }
    }
    
    public stop() {
        this._clickListeners = [];
        this._drawListeners = [];
        this.gameState = GameState.END;
        this.mctsWorker.terminate();
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
            if (this.board.turn) {
                let lastMove = this.board.undoStack.peek();
                
                this.mctsWorker.postMessage({
                    type: 'moved',
                    positionBefore: lastMove.previousPosition,
                    positionAfter: lastMove.movedPawn.position
                });  
                
                this.mctsWorker.postMessage({ type: 'move' });
            }
            
            else
                setTimeout(() => this.players[this.board.turn].move(), 0);
                // this.players[this.board.turn].move();
            return;
        }

        this.gameState = GameState.END;
        this.mctsWorker.postMessage({ type: 'stop' });
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
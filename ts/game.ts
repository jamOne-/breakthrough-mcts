import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';
import {getWorker} from './players/player-worker-factory';

enum GameState {
    INITIALIZING,
    RUNNING,
    END
}

export class Game {
    private _drawListeners : (() => void)[];
    private _endListeners: ((winner : number) => void)[];
    private _initializeListeners: (() => void)[];
    private _gameRunListeners: (() => void)[];
    private _workers : Worker[];
    private _workersReady : number;
    private _playerOptions : number[];

    public selectedPawn : Pawn;
    public gameState : GameState;
    public board : Board;

    public constructor(public boardSize : number,
                    player1Type : string,
                    player2Type : string,
                    playerOptions : number[]) {
        this.restart.apply(this, arguments);
    }

    public restart(boardSize : number, player1Type: string, player2Type : string, playerOptions : number[]) {
        this._drawListeners = [];
        this._endListeners = [];
        this._initializeListeners = [];
        this._gameRunListeners = [];
        this.gameState = GameState.INITIALIZING;
        this.selectedPawn = null;

        this.board = new Board(boardSize);
        this.board.initBoard();
        
        this._playerOptions = playerOptions;
        this._workersReady = 0;
        this._workers = [
            getWorker(player1Type),
            getWorker(player2Type)
        ];

        this._workers.forEach((worker, color) => { 
            worker.onmessage = this._handleWorkerMessage.bind(this, color);
            worker.postMessage({ type: 'start' });
        });
    }
    
    private _handleWorkerMessage(color : number, ev : MessageEvent) {
        switch (ev.data.type) {
            case 'move':
                if (color != this.board.turn) return;
                this.board.movePawn(this.board.getPawn(ev.data.positionBefore), ev.data.positionAfter);
                this.selectedPawn = null;
                this.moved();
                break;
                
            case 'select':
                if (color != this.board.turn) return;
                this.selectedPawn = ev.data.point && this.board.getPawn(ev.data.point) || null;
                this.callDrawListeners();
                break;

            case 'ready':
                this._workersReady++;
                this._checkWorkers();
                break;
            
            default:
                break;
        }
    }

    private _checkWorkers() {
        if (this._workersReady != 2 || this.gameState != GameState.RUNNING) return;

        this._workers.forEach((worker, color) => worker.postMessage({
            type: 'init',
            color: color,
            size: this.boardSize,
            option: this._playerOptions[color]
        }));

        this._workers[0].postMessage({ type: 'move' });
        this.callGameRunListeners();
    }
    
    public stop() {
        this._drawListeners = [];
        this.gameState = GameState.END;
        this._workers.forEach(worker => worker.terminate());
    }
    
    public run() {
        this.callInitializeListeners();
        this.callDrawListeners();
        this.gameState = GameState.RUNNING;

        this._checkWorkers();
    }

    public moved() {
        if (this.gameState == GameState.END) return;
        
        this.callDrawListeners();
        let end = this.board.checkEnd();

        if (end == -1) {
            let lastMove = this.board.undoStack.peek();
            let currentWorker = this._workers[this.board.turn];
            
            currentWorker.postMessage({
                type: 'moved',
                positionBefore: lastMove.previousPosition,
                positionAfter: lastMove.movedPawn.position
            });
            
            currentWorker.postMessage({ type: 'move' });
            return;
        }

        this.stop();
        this.callEndListeners(end);
    }
    
    public callClickListeners(point : Point) {
        this._workers.forEach(worker => worker.postMessage({ type: 'click', point: point }));
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
    
    public addInitializingListener(f : () => void) {
        this._initializeListeners.push(f);
    }
    
    public callInitializeListeners() {
        this._initializeListeners.forEach(f => f());
    }
    
    public addGameRunListener(f : () => void) {
        this._gameRunListeners.push(f);
    }
    
    public callGameRunListeners() {
        this._gameRunListeners.forEach(f => f());
    }
}
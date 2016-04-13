import {Player, PlayerFactory} from './player';
import {Pawn} from './pawn';
import {Point} from './point';

enum GameState {
    RUNNING,
    END
}

export class Game {
    private _clickListeners : ((position : Point) => any)[];
    private _drawListeners : (() => void)[];

    public players : Player[];
    public turn : number;
    public gameState : GameState;
    public board : Pawn[][];

    public constructor(public boardSize : number,
                    player1Type : string,
                    player2Type : string) {
        this.restart.apply(this, arguments);
    }

    public restart(boardSize : number, player1Type: string, player2Type : string) {
        this._clickListeners = [];
        this._drawListeners = [];
        this.turn = 0;
        this.gameState = GameState.RUNNING;

        this.board = new Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++)
            this.board[i] = new Array(this.boardSize);
            
        for (let y = 0; y < 2; y++)
            for (let x = 0; x < this.boardSize; x++)
                this.board[y][x] = new Pawn({ x, y }, 1);
                
        for (let y = this.boardSize - 2; y < this.boardSize; y++)
            for (let x = 0; x < this.boardSize; x++)
                this.board[y][x] = new Pawn({ x, y }, 0);

        this.players = [
            PlayerFactory.create(player1Type, this, 0),
            PlayerFactory.create(player2Type, this, 1)
        ];
    }
    
    public run() {
        this.callDrawListeners();
        this.players[0].move();
    }

    public moved() {
        this.callDrawListeners();
        let end = this.checkEnd();

        if (end == -1) {
            this.turn = (this.turn + 1) % 2;
            this.players[this.turn].move();
            return;
        }

        console.info(end + ' wygral');
        this.gameState = GameState.END;
    }

    public checkEnd() {
        if (this.board[0].some(p => p && p.color === 0)) return 0;
        if (this.board[this.boardSize - 1].some(p => p && p.color === 1)) return 1;
        return -1;
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

    public getPawns(color : number) {
        return this.board.reduce(
                (ret, row) =>
                    ret.concat(
                        row.filter(pawn => pawn && pawn.color === color))).filter(pawn => !!pawn);
    }

    public getPossibleMovesOfAPawn(pawn : Pawn) {
        if (!pawn) return [];
        
        let possibleMoves : Point[] = [];
        let deltay = pawn.color ? 1 : -1;

        for (let deltax = -1; deltax <= 1; deltax++) {
            let x = pawn.position.x + deltax;
            let y = pawn.position.y + deltay;

            if (x >= 0 && x < this.boardSize &&
                y >= 0 && y < this.boardSize &&
                (!this.board[y][x] || (deltax !== 0 && this.board[y][x].color !== pawn.color)))
                    possibleMoves.push({ x, y });
        }
        
        return possibleMoves;
    }
    
    public movePawn(pawn : Pawn, position : Point) {
        this.board[pawn.position.y][pawn.position.x] = undefined;
        pawn.position = position;
        this.board[position.y][position.x] = pawn;
    }
    
    public getPawn(position : Point) {
        return this.board[position.y][position.x];
    }
}
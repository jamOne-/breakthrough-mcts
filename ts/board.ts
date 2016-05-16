import {Pawn} from './pawn';
import {Point} from './point';

export class Board {
    public board : Pawn[][];
    public turn : number;
    public turnNumber : number;
    
    public constructor(public boardSize : number) {}
    
    public initBoard() {
        this.turn = 0;
        this.turnNumber = 0;
        
        this.board = new Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++)
            this.board[i] = new Array(this.boardSize);
            
        for (let y = 0; y < 2; y++)
            for (let x = 0; x < this.boardSize; x++)
                this.board[y][x] = new Pawn({ x, y }, 1);
                
        for (let y = this.boardSize - 2; y < this.boardSize; y++)
            for (let x = 0; x < this.boardSize; x++)
                this.board[y][x] = new Pawn({ x, y }, 0);
    }
    
    public copyBoard() {
        let board = new Board(this.boardSize);
        board.turn = this.turn;
        board.board = JSON.parse(JSON.stringify(this.board));
        
        return board;
    }
    
    public checkEnd() {
        if (!this.board.some(row => row.some(p => p && p.color === 1))) return 0;
        if (!this.board.some(row => row.some(p => p && p.color === 0))) return 1;
        if (this.board[0].some(p => p && p.color === 0)) return 0;
        if (this.board[this.boardSize - 1].some(p => p && p.color === 1)) return 1;
        return -1;
    }
    
    public nextTurn() {
        this.turn ^= 1;
        this.turnNumber++;
    }
    
    public previousTurn() {
        this.turn ^= 1;
        this.turnNumber--;
    }
    
    public getPawns(color : number) {
        return this.board.reduce(
                (ret, row) =>
                    ret.concat(
                        row.filter(pawn => pawn && pawn.color === color)), []);
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
    
    public getPossibleMovesOfPawns(color : number) : { pawn : Pawn, point : Point }[] {
        if (this.checkEnd() != -1) return [];
        
        return Array.prototype.concat.apply([], this.getPawns(color).map(p => {
            return this.getPossibleMovesOfAPawn(p).map(point => { return { pawn: p, point }; })
        }));
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
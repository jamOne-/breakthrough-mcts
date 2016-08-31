import {Pawn} from './pawn';
import {Point} from './point';
import {Stack} from './stack';

export class Board {
    private _pawns : Pawn[][];
        
    public board : Pawn[][];
    public turn : number;
    public turnNumber : number;
    public undoStack : Stack<UndoHistory>;
    
    public constructor(public boardSize : number) {}
    
    public initBoard() {
        this.turn = 0;
        this.turnNumber = 0;
        this.undoStack = new Stack<UndoHistory>();
        this._pawns = [[], []];
        
        this.board = new Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++)
            this.board[i] = new Array(this.boardSize);
            
        for (let y = 0; y < 2; y++)
            for (let x = 0; x < this.boardSize; x++) {
                let pawn = new Pawn({ x, y }, 1);
                this.board[y][x] = pawn;
                this._pawns[1].push(pawn);
            }
                
        for (let y = this.boardSize - 2; y < this.boardSize; y++)
            for (let x = 0; x < this.boardSize; x++) {
                let pawn = new Pawn({ x, y }, 0);
                this.board[y][x] = pawn;
                this._pawns[0].push(pawn);
            }
    }
    
    public checkEnd() {
        if (!this._pawns[1].length) return 0;
        if (!this._pawns[0].length) return 1;
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
        return this._pawns[color];
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
        
        return Array.prototype.concat.apply([], this._pawns[color].map(p => {
            return this.getPossibleMovesOfAPawn(p).map(point => { return { pawn: p, point }; })
        }));
    }
    
    public movePawn(pawn : Pawn, point : Point) {
        let previousPawn = this.getPawn(point);
        this.undoStack.push({
            movedPawn: pawn,
            previousPosition: JSON.parse(JSON.stringify(pawn.position)),
            previousPawn: previousPawn
        });
        
        if (previousPawn) this._pawns[previousPawn.color].splice(this._pawns[previousPawn.color].indexOf(previousPawn), 1);
        
        this.board[pawn.position.y][pawn.position.x] = undefined;
        pawn.position = point;
        this.board[point.y][point.x] = pawn;
        
        this.nextTurn();
    }
    
    public undoMove() {
        let move = this.undoStack.pop();
        if (move.previousPawn) this._pawns[move.previousPawn.color].push(move.previousPawn);
        this.board[move.movedPawn.position.y][move.movedPawn.position.x] = move.previousPawn;        
        move.movedPawn.position = move.previousPosition;
        this.board[move.previousPosition.y][move.previousPosition.x] = move.movedPawn;
        
        this.previousTurn();
    }
    
    public getPawn(position : Point) {
        return this.board[position.y][position.x];
    }

    public pawnDistance(pawn : Pawn) {
        if (pawn.color)
            return pawn.position.y;
        
        return this.boardSize - 1 - pawn.position.y;
    }
}

interface UndoHistory {
    movedPawn: Pawn,
    previousPosition: Point,
    previousPawn: Pawn
}
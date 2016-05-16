import {Player} from './player';
import {Pawn} from './pawn';
import {Point} from './point';
import {Board} from './board';
import {Game} from './game';

export class MCTSPlayer extends Player {
    private cp : number;
    
    public constructor(board : Board,
                       color : number,
                       _onMove : (() => void)) {
        super(board, color, _onMove);
        this.cp = Math.SQRT1_2;
    }
    
    public move() {
        let move = this._UCTSearch();
        
        this.board.movePawn(move.pawn, move.point);
        this._onMove();
    }
    
    private _UCTSearch() {
        let startTime = Date.now();
        let root = new TreeNode(null, this.board.getPossibleMovesOfPawns(this.color), null, null, null);
        
        while (Date.now() - startTime < 2000) {
            let v = this._treePolicy(root);
            let reward = this._defaultPolicy(v);
            this._backUp(v, reward);
        }

        console.log(root.q, root.n);        
        return root.moves[this._bestChild(root, 0)];
    }
    
    private _treePolicy(v : TreeNode) : TreeNode {
        while (v.moves.length > 0) {
            if (v.n < v.moves.length)
                return this._expand(v);
            
            let bestChild = this._bestChild(v, this.cp);
            this.board.movePawn(v.moves[bestChild].pawn, v.moves[bestChild].point);
            this.board.nextTurn();
            
            v = v.children[bestChild];
        }
        
        return v;
    }
    
    private _expand(v : TreeNode) {
        let length = v.moves.length;
        let candidates = [];
        
        for (let i = 0; i < length; i++)
            if (!v.children[i]) candidates.push(i);
            
        let moveNumber = candidates[~~(Math.random() * candidates.length)];
        let move = v.moves[moveNumber];
        let previousPawn = this.board.getPawn(move.point);
        let previousPosition : Point = JSON.parse(JSON.stringify(move.pawn.position)); 
        this.board.movePawn(move.pawn, move.point);
        this.board.nextTurn();
        
        let newNode = new TreeNode(v, this.board.getPossibleMovesOfPawns(this.board.turn), move.pawn, previousPawn, previousPosition);
        v.children[moveNumber] = newNode;
        
        return newNode;
    }
    
    private _bestChild(v : TreeNode, c : number) : string {
        let moves = [];
        let max = Number.NEGATIVE_INFINITY;
        
        for (let key in v.children) {
            let u = v.children[key];
            let value = u.q / u.n + c * Math.sqrt(2 * Math.log(v.n) / u.n);
            
            if (value > max) {
                moves = [key];
                max = value;
            }
            
            else if (value == max)
                moves.push(key);
        }
        
        return moves[~~(Math.random() * moves.length)];
    }
    
    private _defaultPolicy(v : TreeNode) {
        let game = new Game(this.board.boardSize, 'random', 'random');
        let winner = -1;
        
        game.addEndListener(w => winner = w);
        game.board = this.board.copyBoard();
        game.players[0].board = game.board;
        game.players[1].board = game.board;
        game.board.previousTurn();
        game.moved();
        
        return +(winner == this.board.turn);
    }
    
    private _backUp(v : TreeNode, reward : number) {
        while (v != null) {
            v.q += reward;
            v.n++;
            reward ^= 1;

            if (v.parent != null) {
                this.board.previousTurn();
                this.board.movePawn(v.movedPawn, v.previousPosition);
                if (v.previousPawn) this.board.movePawn(v.previousPawn, v.previousPawn.position);
            }

            v = v.parent;
        }
    }
}

class TreeNode {
    q : number;
    n : number;
    children : { [moveNumber: number] : TreeNode; };
    
    public constructor(public parent : TreeNode,
                       public moves : { pawn : Pawn, point : Point }[],
                       public movedPawn : Pawn,
                       public previousPawn : Pawn,
                       public previousPosition : Point) {
        this.q = 0;
        this.n = 0;
        this.children = {};
    }
}
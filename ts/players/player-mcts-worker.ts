import {Board} from './../board';
import {Pawn} from './../pawn';
import {Point} from './../point';

class TreeNode {
    q : number;
    n : number;
    expanded : number;
    children : { [moveNumber: number] : TreeNode; };

    public constructor(public parent : TreeNode,
                       public moves : { pawn : Pawn, point : Point }[]) {
        this.q = 0;
        this.n = 0;
        this.expanded = 0;
        this.children = {};
    }
}

let aggressiveness = 0.99;
let attack_closest = 0.99;
let thinkingTime = 10000;
let cp = Math.SQRT1_2;
let root : TreeNode = null;
let color : number = null;
let board : Board = null
let working = true;
let requestTime = 0;

onmessage = (ev : MessageEvent) => {
    switch (ev.data.type) {
        case 'init':
            color = ev.data.color;
            board = new Board(ev.data.size);
            thinkingTime = ev.data.option;
            board.initBoard();
            
            moveRoot();
            UCTSearch();
            break;
        
        case 'stop':
            working = false;
            break;
            
        case 'move':
            requestTime = Date.now();
            break;
            
        case 'moved':
            board.movePawn(board.getPawn(ev.data.positionBefore), ev.data.positionAfter);
            moveRoot();
            break;
            
        default:
            break;
    }
}

let UCTSearch = () => {
    let start = Date.now();
    let now;
    
    while (working) {
        now = Date.now();
        
        if (now - start > 500)
            return setTimeout(UCTSearch.bind(this), 0);
            
        if (requestTime && now - requestTime > thinkingTime)
            moveBest();

        let v = treePolicy(root);
        let reward = defaultPolicy(board.turn);
        backUp(v, reward);
    }
    
    close();   
}

let treePolicy = (v : TreeNode) : TreeNode => {
    while (v.moves.length > 0) {
        if (v.expanded < v.moves.length)
            return expand(v);

        let best = bestChild(v, cp);
        board.movePawn(v.moves[best].pawn, v.moves[best].point);

        v = v.children[best];
    }

    return v;    
}

let expand = (v : TreeNode) : TreeNode => {
    let length = v.moves.length;
    let candidates = [];

    for (let i = 0; i < length; i++)
        if (!v.children[i]) candidates.push(i);

    let moveNumber = candidates[~~(Math.random() * candidates.length)];
    let move = v.moves[moveNumber];
    board.movePawn(move.pawn, move.point);

    let newNode = new TreeNode(v, board.getPossibleMovesOfPawns(board.turn));
    v.children[moveNumber] = newNode;
    v.expanded++;
    
    return newNode;    
}

let bestChild = (v : TreeNode, c : number) : string => {
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

let defaultPolicy = (turn : number) : number => {
    let winner = board.checkEnd();
    if (winner != -1) return winner ^ turn;

    for (let pawn of board.getPawns(board.turn))
        if (board.pawnDistance(pawn) == board.boardSize - 2)
            return board.turn ^ turn;
    
    let moves = board.getPossibleMovesOfPawns(board.turn);
    
    if (Math.random() < aggressiveness) {
        let attackMoves : {pawn : Pawn; point : Point}[] = [];
        
        if (Math.random() < attack_closest) {
            moves.forEach(move => {
                let pawn = board.getPawn(move.point);
                if (!pawn) return;

                if (attackMoves.length &&
                    board.pawnDistance(pawn) > board.pawnDistance(board.getPawn(attackMoves[0].point)))
                    attackMoves = [];

                if (!attackMoves.length ||
                    board.pawnDistance(pawn) == board.pawnDistance(board.getPawn(attackMoves[0].point)))
                    attackMoves.push(move);
            });
        }

        else
            attackMoves = moves.filter(move => !!board.getPawn(move.point));
        
        if (attackMoves.length)
            moves = attackMoves;
    }
    
    let move = moves[~~(Math.random() * moves.length)];
    board.movePawn(move.pawn, move.point);
    
    let result = defaultPolicy(turn);
    
    board.undoMove();
    
    return result; 
}

let backUp = (v : TreeNode, reward : number) : void => {
    while (v != null) {
        v.q += reward;
        v.n++;
        reward ^= 1;

        if (v.parent != null)
            board.undoMove();

        v = v.parent;
    }
}

let moveRoot = () => {
    if (root) {
        let moveNumber = 0;
        root.moves.some((move, i) => 
            move.pawn.position.x == move.point.x &&
            move.pawn.position.y == move.point.y &&
            !!(moveNumber = i));
            
        root = root.children[moveNumber];
        if (root) root.parent = null;
    }
        
    if (!root)
        root = new TreeNode(null, board.getPossibleMovesOfPawns(board.turn));
}

let moveBest = () => {
    console.log("MCTS games in root: ", root.n);
    
    let best = bestChild(root, 0);
    let move = root.moves[best];
    
    root = root.children[best];
    root.parent = null;
    
    console.log("MCTS current root stats: ", (root.q * 100 / root.n).toString() + "%", root.q, root.n);
    
    requestTime = 0;  
    (postMessage as any)({
        type: 'move',
        positionBefore: move.pawn.position,
        positionAfter: move.point
    });
    
    board.movePawn(move.pawn, move.point);
}

(postMessage as any)({
    type: 'ready'
});
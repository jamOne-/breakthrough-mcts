import {Board} from './board';
import {Pawn} from './pawn';
import {Point} from './point';

class TreeNode {
    q : number;
    n : number;
    children : { [moveNumber: number] : TreeNode; };

    public constructor(public parent : TreeNode,
                       public moves : { pawn : Pawn, point : Point }[]) {
        this.q = 0;
        this.n = 0;
        this.children = {};
    }
}

let aggressiveness = 1.0;
let cp = Math.SQRT1_2;
let root : TreeNode = null;
let color : number = null;
let board = new Board(8);
let working = true;
let requestTime = 0;
board.initBoard();

onmessage = (ev : MessageEvent) => {
    switch (ev.data.type) {
        case 'color':
            color = ev.data.color;
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
            if (!board.getPawn(ev.data.positionBefore))
                debugger;
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
            
        if (requestTime && now - requestTime > 60000)
            moveBest();

        let v = treePolicy(root);
        let reward = defaultPolicy(board.turn);
        backUp(v, reward);
    }
    
    close();   
}

let treePolicy = (v : TreeNode) : TreeNode => {
    while (v.moves.length > 0) {
        if (v.n < v.moves.length)
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
    return doSomeRandomMoves(turn);
}

let doSomeRandomMoves = (turn : number) : number => {
    let winner = board.checkEnd();
    if (winner != -1) return winner ^ turn;
    
    let moves = board.getPossibleMovesOfPawns(board.turn);
    
    if (Math.random() < aggressiveness) {
        let attackMoves = moves.filter(move => !!board.getPawn(move.point));
        if (attackMoves.length)
            moves = attackMoves;
    }
    
    let move = moves[~~(Math.random() * moves.length)];
    
    if (!move)  // todo ??????????????????????
        debugger;
        //return board.turn;
    
    let previousPawn = board.getPawn(move.point);
    let previousPosition : Point = JSON.parse(JSON.stringify(move.pawn.position));
    
    board.movePawn(move.pawn, move.point);
    
    let result = doSomeRandomMoves(turn);
    
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
    console.log(root.n);
    
    let best = bestChild(root, 0);
    let move = root.moves[best];
    
    root = root.children[best];
    root.parent = null;
    
    console.log((root.q * 100 / root.n).toString() + "%", root.q, root.n);
    
    requestTime = 0;  
    (postMessage as any)({
            positionBefore: move.pawn.position,
            positionAfter: move.point
        }
    );
    
    board.movePawn(move.pawn, move.point);
}
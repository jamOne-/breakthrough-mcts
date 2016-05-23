import {Board} from './board';
import {Pawn} from './pawn';
import {Point} from './point';

let color;
let board = new Board(8);
let valueFunction : (board : Board) => number;
board.initBoard();

onmessage = (ev : MessageEvent) => {
    switch (ev.data.type) {
        case 'color':
            color = ev.data.color;
            break;
        
        case 'stop':
            close();
            break;
            
        case 'move':
            move();
            break;
            
        case 'moved':
            board.movePawn(board.getPawn(ev.data.positionBefore), ev.data.positionAfter);
            break;
            
        case 'value function':
            switch (ev.data.functionNumber) {
                case '1':
                    valueFunction = _valueFunction1;
                    break;
                
                case '2':
                    valueFunction = _valueFunction2;
                    break;
                    
                case '3':
                    valueFunction = _valueFunction3;
                    break;
            }
            break;
            
        default:
            break;
    }
}

let move = () => {
    let moves = negamax(5, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    let move = moves[Math.floor(Math.random() * moves.length)];

    (postMessage as any)({
        type: 'move',
        positionBefore: move.pawn.position,
        positionAfter: move.move 
    });

    board.movePawn(move.pawn, move.move);
}

let orderPawns = (pawns: Pawn[]) => {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    pawns.sort((a, b) => pawnDistance(b) - pawnDistance(a));
    return pawns;
}

let negamax = (depth : number, a : number, b : number) => {
    if (depth === 0) return [{ value: valueFunction(board), move: null, pawn: null }];
    
    let maxMoves = [{ pawn: null, move: null, value: Number.NEGATIVE_INFINITY }];
    orderPawns(board.getPawns(board.turn)).every(pawn => {
        return board.getPossibleMovesOfAPawn(pawn).every(move => {
            let previousPawn = board.getPawn(move);
            let previousPosition : Point = JSON.parse(JSON.stringify(pawn.position));
            let value = 0;
            
            board.movePawn(pawn, move);
            
            if (board.checkEnd() === -1)
                value = - negamax(depth - 1, -b, -a)[0].value;
            else
                value = 9999999 - board.turnNumber;
                        
            board.undoMove();
            
            if (value === maxMoves[0].value)
                maxMoves.push({ move, pawn, value });
            else if (value > maxMoves[0].value)
                maxMoves = [{ move, pawn, value }];
                
            a = Math.max(a, value);
            
            return a < b;
        });
    });
    
    return maxMoves;
}

let _valueFunction1 = (board : Board) => {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    let playerColor = board.turn;
    
    let enemyColor = playerColor ^ 1;
    let endingPosition = board.checkEnd();
    
    if (endingPosition === playerColor) return 9999999 - board.turnNumber;
    else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
    
    let myPawns = board.getPawns(playerColor);
    let enemyPawns = board.getPawns(enemyColor);
    
    let mySortedDistances = myPawns.map(p => pawnDistance(p)).sort((a, b) => b - a);
    let enemySortedDistances = enemyPawns.map(p => pawnDistance(p)).sort((a, b) => b - a);
    
    let i = 1;
    let myValue = mySortedDistances.reduce((val, a) => { i /= 2; return val + a * i; }) + 3 * myPawns.length;
    
    i = 1
    let enemyValue = enemySortedDistances.reduce((val, a) => { i /= 2; return val + a * i; }) + 3 * enemyPawns.length;
    
    return myValue - enemyValue;
}

let _valueFunction2 = (board : Board) => {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    let playerColor = board.turn;
    
    let enemyColor = playerColor ^ 1;
    let endingPosition = board.checkEnd();
    
    if (endingPosition === playerColor) return 9999999 - board.turnNumber;
    else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
    
    let myPawns = board.getPawns(playerColor);
    let enemyPawns = board.getPawns(enemyColor);
    let myValue = myPawns.reduce((max, pawn) => Math.max(max, pawnDistance(pawn)), 0) + myPawns.length;
    let enemyValue = enemyPawns.reduce((max, pawn) => Math.max(max, pawnDistance(pawn)), 0) + enemyPawns.length;
    
    return myValue - enemyValue;
}

let _valueFunction3 = (board : Board) => {
    let pawnDistance = (pawn : Pawn) => {
        if (pawn.color) return pawn.position.y + 1;
        return board.boardSize - pawn.position.y;
    }
    
    let playerColor = board.turn;
    
    let enemyColor = playerColor ^ 1;
    let endingPosition = board.checkEnd();
    
    if (endingPosition === playerColor) return 9999999 - board.turnNumber;
    else if (endingPosition === enemyColor) return -9999999 + board.turnNumber;
    
    let myPawns = board.getPawns(playerColor);
    let enemyPawns = board.getPawns(enemyColor);
    let myValue = myPawns.reduce((val, pawn) => val * pawnDistance(pawn), 1);
    let enemyValue = enemyPawns.reduce((val, pawn) => val * pawnDistance(pawn), 1);
    
    return myValue - enemyValue;
}
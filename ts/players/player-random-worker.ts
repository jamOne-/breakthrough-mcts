import {Board} from './../board';

let color;
let board : Board = null;

onmessage = (ev : MessageEvent) => {
    switch (ev.data.type) {
        case 'init':
            color = ev.data.color;
            board = new Board(ev.data.size);
            board.initBoard();
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
            
        default:
            break;
    }
}

let move = () => {
    let moves = board.getPossibleMovesOfPawns(color);
    let move = moves[~~(Math.random() * moves.length)];
    
    (postMessage as any)({
        type: 'move',
        positionBefore: move.pawn.position,
        positionAfter: move.point
    });
    
    board.movePawn(move.pawn, move.point);
}
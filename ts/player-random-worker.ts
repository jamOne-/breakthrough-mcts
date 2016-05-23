import {Board} from './board';

let color;
let board = new Board(8);
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
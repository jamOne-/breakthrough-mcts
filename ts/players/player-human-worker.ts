import {Board} from './../board';
import {Point} from './../point';
import {Pawn} from './../pawn';

let color = 0;
let board : Board = null;
let movePermitted = false;
let selectedPawn : Pawn = null;

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
            movePermitted = true;
            break;

        case 'moved':
            board.movePawn(board.getPawn(ev.data.positionBefore), ev.data.positionAfter);
            break;

        case 'click':
            handleClick(ev.data.point);
            break;

        default:
            break;
    }
}

let handleClick = (point : Point) => {
    if (!movePermitted) return;

    if (!selectedPawn) selectPawn(point);
    else               movePawn(point);
}

let selectPawn = (point : Point) => {
    let clickedPawn = board.getPawn(point);

    if (selectedPawn != clickedPawn && clickedPawn && clickedPawn.color === color)
        selectedPawn = clickedPawn;

    else
        selectedPawn = null;

    (postMessage as any)({
        type: 'select',
        point: selectedPawn && selectedPawn.position || null
    });
}

let movePawn = (point : Point) => {
    let possibleMoves = board.getPossibleMovesOfAPawn(selectedPawn);
    if (possibleMoves.some(p => p.x === point.x && p.y === point.y)) {
        (postMessage as any)({
            type: 'move',
            positionBefore: selectedPawn.position,
            positionAfter: point
        });

        board.movePawn(selectedPawn, point);
        movePermitted = false;
        selectedPawn = null;
        return;
    }

    selectPawn(point);
}
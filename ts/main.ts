import {Game} from './game';
import {Pawn} from './pawn';
import {Point} from './point';
import {getOption} from './players/player-worker-factory';

setTimeout(() => {
    let loading = document.getElementById('loading');
    loading.classList.add('loading-done');
    document.getElementById('content-container').classList.remove('hidden');
    setTimeout(() => loading.classList.add('hidden'), 350);
}, 1000);

class Main {
    private static _canvas : HTMLCanvasElement;
    private static _game : Game;
    
    public static init() {
        Main._canvas = <HTMLCanvasElement>document.getElementById('game-canvas');
        Main._canvas.addEventListener('click', Main._propagateClick, false);
        window.addEventListener('resize', Main._resizeCanvas, false);
        document.getElementById('button-new-game').onclick = Main._createGame;
        document.getElementById('player-white').onchange = Main._playerTypeChanged.bind(this, 'white');
        document.getElementById('player-black').onchange = Main._playerTypeChanged.bind(this, 'black');
        
        Main._resizeCanvas();
        Main._createGame();
    }

    public static draw() {
        let context = Main._canvas.getContext('2d');
        let squareSize = Main._calcSquareSize();
        
        let drawBoard = () => {
            context.fillStyle = "rgba(192, 161, 114, 1)";
            for (let i = 0; i < Main._game.boardSize; i++) {
                for (let j = ~(i & 1); j < Main._game.boardSize; j += 2)
                    context.fillRect (j * squareSize, i * squareSize, squareSize, squareSize);
            }
        };
        
        let drawPawn = (pawn : Pawn) => {
            if (pawn.color)     context.fillStyle = "rgb(0, 0, 0)";
            else                context.fillStyle = "rgb(255, 255, 255)";
            
            context.beginPath();
            context.arc((pawn.position.x + 0.5) * squareSize, (pawn.position.y + 0.5) * squareSize, 0.7 * squareSize / 2, 0, Math.PI * 2, true);
            context.fill();
            if (!pawn.color) context.stroke();
        };
        
        let drawSelection = (position : Point) => {            
            context.lineWidth <<= 1;
            context.fillStyle = "rgb(0, 0, 0)";
            context.strokeRect(position.x * squareSize, position.y * squareSize, squareSize, squareSize);
            context.lineWidth >>= 1;
        };
        
        context.clearRect(0, 0, Main._canvas.width, Main._canvas.height);
        drawBoard();
        Main._game.board.board.forEach(row => row.forEach(pawn => pawn && drawPawn(pawn)));
        
        if (Main._game.selectedPawn) {
            drawSelection(Main._game.selectedPawn.position);
            Main._game.board.getPossibleMovesOfAPawn(Main._game.selectedPawn).forEach(drawSelection);
        }
        
        if (!Main._game.board.undoStack.isEmpty()) {
            let lastMove = Main._game.board.undoStack.peek();
            drawSelection(lastMove.movedPawn.position);
            drawSelection(lastMove.previousPosition);
        }
    }
    
    private static _createGame() {
        let white = (<HTMLSelectElement>document.getElementById('player-white')).value;
        let black = (<HTMLSelectElement>document.getElementById('player-black')).value;
        let size = (<HTMLSelectElement>document.getElementById('board-size')).value;
        let whiteOption = parseInt((<HTMLInputElement>document.getElementById('option-white')).value) ||
                          parseInt(getOption(white).default);
        let blackOption = parseInt((<HTMLInputElement>document.getElementById('option-black')).value) ||
                          parseInt(getOption(black).default);
        
        if (Main._game) Main._game.stop();
        Main._game = new Game(parseInt(size), white, black, [whiteOption, blackOption]);
        Main._game.addDrawListener(Main.draw);
        Main._game.addEndListener((winner) => console.info(winner + ' wygral'));
        Main._game.run();
    }
    
    private static _propagateClick(ev : MouseEvent) {
        if (ev.button !== 0) return;
        
        let squareSize = Main._calcSquareSize();
        let x = (ev.clientX - Main._canvas.getBoundingClientRect().left) / squareSize;
        let y = (ev.clientY - Main._canvas.getBoundingClientRect().top) / squareSize;
        x = Math.floor(x);
        y = Math.floor(y);
        Main._game.callClickListeners({ x, y });
    }
    
    private static _calcSquareSize() {
        return Main._canvas.width / Main._game.boardSize;
    }

    private static _resizeCanvas() {
        let len = Math.min(window.innerHeight - (window.innerWidth < 1000 ? 56 : 64), window.innerWidth);
        Main._canvas.style.width = len.toString() + 'px';
        Main._canvas.style.height = len.toString() + 'px';
        Main._canvas.width = len;
        Main._canvas.height = len;
        
        if (Main._game) Main.draw();
    }
    
    private static _playerTypeChanged(color : string, ev : Event) {
        let playerType = (<HTMLSelectElement>ev.target).value;
        let option = getOption(playerType);
        let optionDiv = document.getElementById('option-' + color + '-div');
        
        if (!option) {
            optionDiv.classList.add('hide');
            setTimeout(() => { optionDiv.classList.add('hidden'); }, 500);    
            return;
        }
        
        document.getElementById('option-' + color + '-label').innerHTML = option.label;
        (<HTMLInputElement>document.getElementById('option-' + color)).value = option.default;
        optionDiv.classList.add('is-dirty');
        
        optionDiv.classList.remove('hidden');
        setTimeout(() => { optionDiv.classList.remove('hide'); }, 10);
    }
}

Main.init();
define(["require", "exports", './game'], function (require, exports, game_1) {
    "use strict";
    setTimeout(function () {
        var loading = document.getElementById('loading');
        loading.classList.add('loading-done');
        document.getElementById('content-container').classList.remove('hidden');
        setTimeout(function () { return loading.classList.add('hidden'); }, 350);
    }, 1000);
    var Main = (function () {
        function Main() {
        }
        Main.init = function () {
            Main._canvas = document.getElementById('game-canvas');
            Main._canvas.addEventListener('click', Main._propagateClick, false);
            window.addEventListener('resize', Main._resizeCanvas, false);
            document.getElementById('button-new-game').onclick = Main._createGame;
            Main._resizeCanvas();
            Main._createGame();
        };
        Main.draw = function () {
            var context = Main._canvas.getContext('2d');
            var squareSize = Main._calcSquareSize();
            var drawBoard = function () {
                context.fillStyle = "rgba(192, 161, 114, 1)";
                for (var i = 0; i < Main._game.boardSize; i++) {
                    for (var j = (Main._game.boardSize % 2 || i % 2 ? 0 : 1); j < Main._game.boardSize; j += 2)
                        context.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
                }
            };
            var drawPawn = function (pawn) {
                if (pawn.color)
                    context.fillStyle = "rgb(0, 0, 0)";
                else
                    context.fillStyle = "rgb(255, 255, 255)";
                context.beginPath();
                context.arc((pawn.position.x + 0.5) * squareSize, (pawn.position.y + 0.5) * squareSize, 0.7 * squareSize / 2, 0, Math.PI * 2, true);
                context.fill();
                if (!pawn.color)
                    context.stroke();
            };
            var drawSelection = function (position) {
                context.lineWidth <<= 1;
                context.fillStyle = "rgb(0, 0, 0)";
                context.strokeRect(position.x * squareSize, position.y * squareSize, squareSize, squareSize);
                context.lineWidth >>= 1;
            };
            context.clearRect(0, 0, Main._canvas.width, Main._canvas.height);
            drawBoard();
            Main._game.board.forEach(function (row) { return row.forEach(function (pawn) { return pawn && drawPawn(pawn); }); });
            Main._game.players.forEach(function (player) {
                return player.selectedPawn &&
                    (drawSelection(player.selectedPawn.position) ||
                        Main._game.getPossibleMovesOfAPawn(player.selectedPawn).forEach(drawSelection));
            });
        };
        Main._createGame = function () {
            var white = document.getElementById('player-white').value;
            var black = document.getElementById('player-black').value;
            Main._game = new game_1.Game(8, white, black);
            Main._game.addDrawListener(Main.draw);
            Main._game.run();
        };
        Main._propagateClick = function (ev) {
            if (ev.button !== 0)
                return;
            var squareSize = Main._calcSquareSize();
            var x = (ev.clientX - Main._canvas.getBoundingClientRect().left) / squareSize;
            var y = (ev.clientY - Main._canvas.getBoundingClientRect().top) / squareSize;
            x = Math.floor(x);
            y = Math.floor(y);
            Main._game.handleClick({ x: x, y: y });
        };
        Main._calcSquareSize = function () {
            return Main._canvas.width / Main._game.boardSize;
        };
        Main._resizeCanvas = function () {
            var len = Math.min(window.innerHeight - (window.innerWidth < 1000 ? 56 : 64), window.innerWidth);
            Main._canvas.style.width = len.toString() + 'px';
            Main._canvas.style.height = len.toString() + 'px';
            Main._canvas.width = len;
            Main._canvas.height = len;
            if (Main._game)
                Main.draw();
        };
        return Main;
    }());
    Main.init();
});
//# sourceMappingURL=main.js.map
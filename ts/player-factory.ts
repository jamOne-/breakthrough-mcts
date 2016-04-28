import {MinMaxPlayer, valueFunction, valueFunction2, valueFunction3} from './player-minmax';
import {HumanPlayer} from './player-human';
import {RandomPlayer} from './player-random';
import {Board} from './board';

export class PlayerFactory {
    public static create(type : string,
                         board : Board,
                         color : number,
                         onMove : (() => void),
                         addClickListener,              // todo: otypować
                         callDrawListeners) {
        switch (type) {
            case 'random':
                return new RandomPlayer(board, color, onMove);
                
            case 'minmax1':
                return new MinMaxPlayer(board, color, onMove, valueFunction);
                
            case 'minmax2':
                return new MinMaxPlayer(board, color, onMove, valueFunction2);
                
            case 'minmax3':
                return new MinMaxPlayer(board, color, onMove, valueFunction3);
        
            case 'human':
            default:
                return new HumanPlayer(board, color, onMove, addClickListener, callDrawListeners);
        }
    }
}
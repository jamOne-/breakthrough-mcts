import {Pawn} from './pawn';
import {Board} from './board';

export abstract class Player {
    public selectedPawn : Pawn;
    public abstract move();

    public constructor(public board : Board,
                       public color : number,
                       public _onMove : (() => void)) {}            // todo: public?
}
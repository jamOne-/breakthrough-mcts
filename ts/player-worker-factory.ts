import * as MCTSWorker from 'worker-loader?name=./js/generated/player-mcts-worker.js!./player-mcts-worker';
import * as HumanWorker from 'worker-loader?name=./js/generated/player-human-worker.js!./player-human-worker';
import * as RandomWorker from 'worker-loader?name=./js/generated/player-random-worker.js!./player-random-worker';

export let getWorker = (type : string) => {
    switch (type) {
        case 'mcts':
            return (new MCTSWorker() as Worker);
        
        case 'random':
            return (new RandomWorker() as Worker);
            
        case 'human':
            return (new HumanWorker() as Worker);
    }
}
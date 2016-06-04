import * as MCTSWorker from 'worker-loader?name=./js/generated/player-mcts-worker.js!./player-mcts-worker';
import * as HumanWorker from 'worker-loader?name=./js/generated/player-human-worker.js!./player-human-worker';
import * as RandomWorker from 'worker-loader?name=./js/generated/player-random-worker.js!./player-random-worker';
import * as MinMaxWorker from 'worker-loader?name=./js/generated/player-minmax-worker.js!./player-minmax-worker';

export let getWorker = (type : string) => {
    switch (type) {
        case 'mcts':
            return (new MCTSWorker() as Worker);
            
        case 'mcts asmjs':
            return new Worker('/js/generated/player-mcts-asmjs-worker.js');
        
        case 'random':
            return (new RandomWorker() as Worker);
            
        case 'human':
            return (new HumanWorker() as Worker);
            
        case 'minmax 1':
        case 'minmax 2':
        case 'minmax 3':
        case 'minmax 4':
            let worker = (new MinMaxWorker() as Worker);
            worker.postMessage({ type: 'value function', functionNumber: type.split(' ')[1] });
            return worker;
    }
}

export let getOption = (type : string) => {
    switch (type) {
        case 'mcts':
        case 'mcts asmjs':
            return { default: "2500", label: "Thinking time (ms)" };
            
        case 'minmax 1':
            return { default: "5", label: "Search depth" };
            
        default:
            return null;
    }
}
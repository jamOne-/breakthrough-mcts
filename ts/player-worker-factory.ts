import * as MCTSWorker from 'worker-loader!./player-mcts-worker';

export let getWorker = (type : string) => {
    switch (type) {
        case 'mcts':
            return (new MCTSWorker() as Worker);
    }
}
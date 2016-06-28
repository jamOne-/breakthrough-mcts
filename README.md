# breakthrough-mcts
Bachelor thesis 2016.

Developing agent which plays Breakthrough using Monte Carlo Tree Search algorithm and compare him with MinMax agent.

Project web page: https://dominiks.site/breakthrough/

### Running project

To run this project you will need Node.js and Emscripten compiler.

Being into project directory, install poject dependences with command:
```sh
$ npm install
```

Next, open emscripten command prompt, navigate to project directory and write:
```sh
$ npm run build
# or:
#   - npm run em++ (just c++ compilation)
#   - webpack      (just TypeScript transpilation)
```

Additionally, application needs to be served somehow (because of Web Workers).
For example, using lite-server (found in dependencies):
```sh
$ lite-server
``` 

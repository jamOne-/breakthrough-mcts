# breakthrough-mcts
Praca licencjacka 2016.

Opracowywanie agenta grającego w grę Breakthrough wykorzystującego algorytm Monte Carlo Tree Search.

Strona projektu: https://dominiks.site

### Uruchomienie projektu

Do uruchomienia projektu potrzebny jest kompilator Emscripten oraz Node.js.

Będąc w katalogu projektu instalujemy zależności projektu poleceniem:
```sh
$ npm install
```

Włączamy emscripten command prompt, nawigujemy do katalogu projektu i wpisujemy:
```sh
$ npm run build
# ewentualnie:
#   - npm run em++ (sama kompilacja kodu c++)
#   - webpack      (transpilcja kodu TypeScript)
```

Dodatkowo aplikację do poprawnego działania trzeba jakoś serwować.
Na przykład dzięki lite-server (znajdującego się w zależnościach):
```sh
$ lite-server
``` 

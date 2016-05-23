# breakthrough-mcts
Praca licencjacka 2016.

Opracowywanie agenta grającego w grę Breakthrough wykorzystującego algorytm Monte Carlo Tree Search.

Strona projektu: https://dominiks.site

### Uruchomienie projektu

Do uruchomienia projektu potrzebny jest Node.js.
Będąc w katalogu projektu instalujemy zależności projektu poleceniem:
```sh
$ npm install
```

Później będąc w katalogu projektu wpisujemy:
```sh
$ webpack
# ewentualnie webpack -w, jeżeli interesuje nas tryb watcher
```

Dodatkowo aplikację do poprawnego działania trzeba jakoś serwować.
Na przykład dzięki lite-server (znajdującego się w zależnościach):
```sh
$ lite-server
``` 

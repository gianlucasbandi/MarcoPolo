
# Marco Polo

Come **Marco Polo** riportò la relazione dei suoi viaggi in Estremo Oriente, il nostro servizio si propone di riportare le informazioni sulla situazione pandemica e sulle immagini più recenti della zona di interesse per un possibile turista.

Dopo aver effettuato l'accesso a **Twitter** tramite la propria email e password, si ha la possibiltà di effettuare una ricerca o di porre delle domande al bot *Marco*.

Nel primo caso bisogna inserire una località, a questo punto si verrà reindirizzati su un'altra pagina ottenendo gli ultimi tweets di quella zona, una mappa di **Google Maps** con un marcatore sul luogo e la situazione pandemica in merito al **Covid-19**.

E' possibile effettuare un'altra ricerca cliccando sul tasto predisposto in fondo alla pagina.


## Tecnologie utilizzate

Server: Node, Express, Nginx, Docker, Docker-compose

API: Twitter (OAuth), Google Maps, About-Corona

Protocolli Asincroni: WebSocket


## Requisiti progetto

La nostra webapp:

1. Offre API, in particolare è possibile:
    - Trovare città con meno casi nel mondo
    - Trovare regione italiana con meno casi
    - Richiedere i casi di una città e, se italiana, anche i casi della sua regione
2. Si interfaccia con 3 servizi REST esterni, di cui 2 di tipo 'commerciale':
    - Twitter: utilizzo tramite la libreria 'twit', OAuth tramite la libreria 'oauth'
    - Google Maps: utilizzo tramite la libreria '@googlemaps/google-maps-services-js'
    - About-Corona
3. Fa uso del protocollo asincrono:
    - WebSocket: utilizzando il protocollo wss
4. Utilizza Docker e docker-compose:
    - Gestione dei singoli container e il loro insieme, automatizzando la preparazione del necessario (installazione moduli, building dei container etc) al fine di garantire il corretto funzionamento del tutto
    - Possibilità di fare testing.
5. Implementa Github Actions per:
    - Testing automatico delle funzionalità ad ogni 'push'
6. Accetta solo richieste https autorizzate tramite l'utilizzo di self-signed certificate.


## Prerequisiti
**Twitter**

Creare un app su https://developer.twitter.com, abilitare OAuth, inserire come callback url 'https://localhost:8083/' e generare le chiavi 'consumer key' e 'consumer secret key'

**Google Maps**

Creare un progetto su https://console.cloud.google.com, abilitare le API per:

    - 'Maps JavaScript API'
    - 'Geocoding API'
    - 'Places API'

e poi generare la chiave di accesso.

Inserire le chiavi ottenute nel file *.env* contenuto nella cartella *node* al posto degli ***:
```bash
TWITTER_CONSUMER_KEY = ***
TWITTER_CONSUMER_SECRET= ***
GOOGLE_MAPS_API_KEY = ***
```
## Installazione

Clonare la repository:
```bash
git clone https://github.com/gianlucasbandi/MarcoPolo
```
Posizionarsi dentro la cartella:
```bash
cd MarcoPolo
```
Eseguire il build delle immagini e avviare il compose:
```bash
docker-compose up -d --build
```
Da Web Browser visitare https://localhost:8083


## Test

Per far partire il test, usa il seguente comando:

```bash
npm test --prefix ./node

```


## Autori

- [@gianlucasbandi](https://www.github.com/gianlucasbandi) 1792041

- [@GitCharlie00](https://github.com/GitCharlie00) 1884561

- [@TiaRusky](https://github.com/TiaRusky) 1918968


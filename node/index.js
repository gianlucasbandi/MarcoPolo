/***********DIPENDENZE*************/
require('dotenv').config();
const express = require('express');
const path = require('path');
const request = require('request');
const qs = require('querystring'); //To manage URL parsing
var Twit = require('twit'); //To use twitter api
const utils = require("./utils");
const bodyParser = require('body-parser');
const { getCovidData, getTweets, getTweetsUrl, tweet2HTML, getTweetsId, getCovidDataItaly, getGeoData, formatCityName } = require('./utils');
var OAuth = require('oauth'); //Twitter OAuth
var session = require('express-session');
const { response } = require('express');
const { basename } = require('path');


const PORT = 3000;
const app = express();

var expressWs = require('express-ws')(app);

const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_CALL_BACK_URL } = process.env; //Rivavo le credenziali Twitter
var TwitterOAuth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    '1.0A',
    TWITTER_CALL_BACK_URL,
    'HMAC-SHA1'
);

//Getting static file and pug's views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    name: "MarcoPolo",
    secret: 'MarcoPoloSecret',
    resave: false,
    saveUninitialized: false,
}));


/***********ROUTES*************/
//Index page
app.get("/", (req, res) => {
    if (req.session.logged == undefined) { //User not logged
        res.render("index", { logged: false });
    } else if (req.session.user_name == undefined) {
        //3 step: getting final token
        const req_data = qs.parse(req);
        var url = "https://api.twitter.com/oauth/access_token?oauth_token=" + req.query.oauth_token + "&oauth_verifier=" + req.query.oauth_verifier;
        request.post({ url: url }, (e, r, body) => {
            const body_data = qs.parse(body);
            req.session.oauth_token = body_data.oauth_token;
            req.session.oauth_token_secret = body_data.oauth_token_secret;
            req.session.user_id = body_data.user_id;
            req.session.user_name = body_data.screen_name;

            res.render("index", { logged: true, username: body_data.screen_name });
        });
    } else { //User already logged
        res.render("index", { logged: true, username: req.session.user_name });
    }

});


//Twitter OAuth
app.get("/login", (req, res) => {
    //1 step: getting request token
    TwitterOAuth.getOAuthRequestToken((error, oauthRequestToken, oauthRequestTokenSecret) => {
        const method = 'authorize';
        if (error) {
            console.log(error);
        } else {
            //2 step: getting authorization from resource owner
            const authorizationUrl = `https://api.twitter.com/oauth/${method}?oauth_token=${oauthRequestToken}`;
            req.session.logged = true;
            res.redirect(authorizationUrl);
        }
    });
});


//SERV
app.get("/nation", async function(req, res) {

    if (req.session.logged == undefined) { //User not logged
        res.render("index", { logged: false });
    } else {
        var city = req.originalUrl.split("=")[1];
        var cases;
        var codNat;
        var nat;
        var reg;
        var regionCases;
        var regionCasesError = false;
        var isThereRegion = false;
        var cityErr = false;

        /**********************************/
        /*Getting recent tweet by geocode*/
        /**********************************/
        var T = new Twit({
            consumer_key: TWITTER_CONSUMER_KEY,
            consumer_secret: TWITTER_CONSUMER_SECRET,
            access_token: req.session.oauth_token,
            access_token_secret: req.session.oauth_token_secret,
            //timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
            strictSSL: true, // optional - requires SSL certificates to be valid.
        });

        var tweetError = false; //true= error occurred
        var tweetMsgError;
        var json_tweets; //Recent tweet in that city
        var tweets_id;

        //Searching the tweet posted in that city
        await getTweets(T, city)
            .then(response => {
                json_tweets = response;
            }).catch(error => {
                tweetMsgError = error;
                tweetError = true;
            });

        //Getting tweet id 
        await getTweetsId(json_tweets)
            .then(response => {
                tweets_id = response;
            })
            .catch(error => {
                tweetMsgError = error;
                tweetError = true;
            });

        /*********************/
        //Getting covid data:
        /*********************/

        await getGeoData(city)
            .then(result => {
                codNat = result[0];
                nat = result[1];
                reg = result[2];
            })
            .catch(err => {
                cityErr = true;
            })

        console.log(codNat);

        if (cityErr) {
            res.render("index", { logged: true, username: req.session.user_name, error: "La città inserita non esiste" });
        } else {
            await getCovidData(codNat)
                .then(result => {
                    cases = result;
                })
                .catch(error => {
                    cases = "ND";
                })

            //Se la città è italiana ricaviamo anche i dati relativi alla regione -->>>>
            if (nat == 'Italia') {
                await getCovidDataItaly(reg)
                    .then(result => {
                        regionCases = result;
                        isThereRegion = true;
                    })
                    .catch(error => {
                        regionCasesError = true;
                    });
            }

            await formatCityName(city)
                .then(response => {
                    city = response;
                })
                .catch(error => {
                    city = error;
                })

            res.render("home", { city: city, nation: nat, covidCases: cases, tweets_id: tweets_id, tweetError: tweetError, tweetMsgError: tweetMsgError, regione: reg, regCas: regionCases, regErr: regionCasesError, isReg: isThereRegion });
        }
    }
});


//Twitter logout
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("index", { logged: false });
});


/*********************/
/******CHAT BOT*******/
/*********************/
app.ws('/chatbot', function(ws, req) {
    ws.on('message', function(msg) {
        switch (msg.toLowerCase()) {
            case "help":
                ws.send("Queste sono le cose che puoi chiedermi:<br> -Cisanini <br>-Cisanini2 <br>-Cisanini3")
                break
            default:
                ws.send("Comando non riconosciuto :(");
        }
    });


    //console.log("Ricevuta connessione ws");
    ws.send("Benvenuto sull'assistenza di MarcoPolo.<br>Usare help per una breve guida ai comandi");
});


/****************************************/
/**********REST API*********************/
/****************************************/

/**
 * @api {get} /covidData/:city Richede dati covid
 * @apiName covidData
 * @apiGroup User
 *
 * @apiParam {String} city Nome della città.
 *
 * @apiSuccess {String} nation Nazione della città inserita.
 * @apiSuccess {String} codNat Codice della nazione della città inserita.
 * @apiSuccess {Int} cases Casi nazionali relativi alla città inserita.
 * @apiSuccess {String} region Regione della città inserita (se italiana).
 * @apiSuccess {Int} regionCases Casi regionali della città inserita (se italiana).
 * @apiSuccess {Boolean} isItalian Indica se la città inserita è italiana.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "nation":"Italia",
 *        "codNat":"IT",
 *        "cases":"84234",
 *        "region":"Lazio",
 *        "regionCases":78454,
 *         "isItalian":true
 *      }
 *
 * @apiError errore Messaggio di errore.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "errore": "La città inserita non esiste"
 *     }
 * */

app.get("/covidData/:city", async function(req, res) {
    var city = req.params.city;
    var nat;
    var codNat;
    var cases;
    var reg;
    var cityErr;
    var regionCases;
    var isThereRegion;

    await getGeoData(city)
        .then(result => {
            codNat = result[0];
            nat = result[1];
            reg = result[2];
        })
        .catch(err => {
            cityErr = true;
        });

    if (cityErr) {
        var result = {
            "errore": "La città inserita non esiste"
        }
    } else {
        await getCovidData(codNat)
            .then(result => {
                cases = result;
            })
            .catch(error => {
                cases = "ND";
            });


        if (nat == 'Italia') {
            await getCovidDataItaly(reg)
                .then(result => {
                    regionCases = result;
                    isThereRegion = true;
                })
                .catch(error => {
                    regionCasesError = true;
                });
        }

        var result = {
            "nation": nat,
            "codNat": codNat,
            "cases": cases,
            "region": reg,
            "regionCases": regionCases,
            "isItalian": isThereRegion
        }
    }
    res.json(result);

});

app.listen(PORT, () => {
    console.log("Applicazione in ascolto sulla porta " + PORT);
});
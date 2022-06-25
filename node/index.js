/***********DIPENDENZE*************/
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const request = require('request');
const qs = require('querystring'); //Per effettuare parsing delle query URL
var Twit = require('twit'); //Per gestire le richieste REST di Twitter
const utils = require("./utils");
const bodyParser = require('body-parser');
const { getCovidData } = require('./utils');
let nodeGeocoder = require('node-geocoder');
const cc = require('country-state-picker');
var OAuth = require('oauth'); //Twitter OAuth

const PORT = 3000;
const app = express();
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


let options = {
    provider: 'openstreetmap',
};

let geoCoder = nodeGeocoder(options);

//Gestione delle views tramite pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views')); //Usato per caricare i file statici (css)
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieParser());


/***********ROUTES*************/
//Pagina iniziale
app.get("/", (req, res) => {
    if (req.cookies.logged == undefined) { //User not logged
        res.render("index", { logged: false });
    } else if (req.cookies.user_name == undefined) {
        //3 step: getting final token
        const req_data = qs.parse(req);
        var url = "https://api.twitter.com/oauth/access_token?oauth_token=" + req.query.oauth_token + "&oauth_verifier=" + req.query.oauth_verifier;
        request.post({ url: url }, (e, r, body) => {
            const body_data = qs.parse(body);

            utils.setCookie("oauth_token", body_data.oauth_token, res);
            utils.setCookie("oauth_token_secret", body_data.oauth_token_secret, res);
            utils.setCookie("user_id", body_data.user_id, res);
            utils.setCookie("user_name", body_data.screen_name, res);

            res.render("index", { logged: true, username: body_data.screen_name });
        });
    } else { //User already logged
        res.render("index", { logged: true, username: req.cookies.user_name });
    }
});


app.get("/login", (req, res) => {
    //1 step: getting request token
    TwitterOAuth.getOAuthRequestToken((error, oauthRequestToken, oauthRequestTokenSecret) => {
        const method = 'authorize';
        if (error) {
            console.log(error);
        } else {
            //2 step: getting authorization from resource owner
            const authorizationUrl = `https://api.twitter.com/oauth/${method}?oauth_token=${oauthRequestToken}`;
            utils.setCookie("logged", true, res);
            res.redirect(authorizationUrl);
        }
    });
});


app.get("/nation", function(req, res) {
    var city = req.originalUrl.split("=")[1];
    var cases;
    var codNat;
    var nat;

    geoCoder.geocode(city)
        .then((result) => {
            codNat = result[0].countryCode;
            request({
                url: 'https://corona.lmao.ninja/v2/countries/' + codNat + '?strict',
                method: 'GET',
            }, function(error, response, body) {
                if (error) {
                    res.end(error);
                } else {
                    nat = cc.getCountry(codNat);
                    console.log(response);
                    if (body.split(":")[0].includes("message") == true) {
                        cases = 'ko';
                    } else {
                        cases = getCovidData(body);
                    }
                    var T = new Twit({
                        consumer_key: TWITTER_CONSUMER_KEY,
                        consumer_secret: TWITTER_CONSUMER_SECRET,
                        access_token: req.cookies.oauth_token,
                        access_token_secret: req.cookies.oauth_token_secret,
                        //timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
                        strictSSL: true, // optional - requires SSL certificates to be valid.
                    });


                    T.get('search/tweets', { q: nat.name, count: 5 }, function(err, data, response) {
                        //console.log(data);
                        //res.write(JSON.stringify(data));
                        var tweets;
                        var tweetsText;
                        for (let i = 0; i < data.statuses.length; i++) {
                            tweets += JSON.stringify(data.statuses[i]);
                            tweetsText += data.statuses[i].text + " ";
                        }
                        //res.write(tweets);
                        //res.write(tweetsText);
                        //res.end("Ricerca finita");
                    });
                    res.render("home", { city: city, nation: nat.name, covidCases: cases });
                }
            });
        })
        .catch((err) => {
            res.render("index", { error: "La città inserita non esiste" });
        });

    //Ricavo i tweet di quella zona

});


app.get("/logout", (req, res) => {
    res.clearCookie("oauth_token");
    res.clearCookie("oauth_token_secret");
    res.clearCookie("user_id");
    res.clearCookie("user_name");
    res.clearCookie("logged");
    res.render("index", { logged: false });
});


app.listen(PORT, () => {
    console.log("Applicazione in ascolto sulla porta " + PORT);
});
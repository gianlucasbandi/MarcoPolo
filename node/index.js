/***********DIPENDENZE*************/
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const request = require('request');
const qs = require('querystring'); //Per effettuare parsing delle query URL
var Twit = require('twit'); //Per gestire le richieste REST di Twitter
require('dotenv').config(); //Per ricavare i token necessari per OAuth
const utils = require("./utils");
const bodyParser = require('body-parser');
const { getCovidData } = require('./utils');

const PORT = 3000;
const app = express();
const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_CALL_BACK_URL } = process.env; //Rivavo le credenziali Twitter
const twitterOAuth = {
    callback: TWITTER_CALL_BACK_URL,
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET
}


//Gestione delle views tramite pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views')); //Usato per caricare i file statici (css)
app.use(bodyParser.urlencoded({ extended: true }));


app.use(cookieParser());


/***********ROUTES*************/
//Pagina iniziale
app.get("/", (req, res) => {
    if (req.cookies.logged == undefined) { //Utente non loggato
        res.render("index", { logged: false });
    } else if (req.cookies.user_name == undefined) { //Devo ancora completare la fase 3 di OAuth
        //3 step : ottenimento token
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
    } else { //L'utente era già loggato
        res.render("index", { logged: true, username: req.cookies.user_name });
    }
});


app.get("/login", (req, res) => {
    //1 step: acquisizione access_token
    var url = "https://api.twitter.com/oauth/request_token";
    request.post({ url: url, oauth: twitterOAuth }, (e, r, body) => {
        const req_data = qs.parse(body);

        //2 step: autorizzazione resource owner
        url = "https://api.twitter.com/oauth/authorize?oauth_token=" + req_data.oauth_token;
        request.get({ uri: url }, (e, r, body) => {
            utils.setCookie("logged", true, res);
            res.end(body);
        });
    });
});


app.get('/nation', function(req, res) {
    var tipo = req.originalUrl.split("=")[1];
    request({
        url: 'https://corona.lmao.ninja/v2/countries/' + tipo + '?strict',
        method: 'GET',
    }, function(error, response, body) {
        if (error) {
            res.end(error);
            console.log(error);
        } else {
            console.log(response);
            if (body.split(":")[0].includes("message") == true) {
                res.end('ko');
            } else {
                var cases = getCovidData(body);
                res.end(cases);
            }
        }
    });
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
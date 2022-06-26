/***********DIPENDENZE*************/
require('dotenv').config();
const express = require('express');
const path = require('path');
const request = require('request');
const qs = require('querystring');                  //To manage URL parsing
var Twit = require('twit');                         //To use twitter api
const utils = require("./utils");
const bodyParser = require('body-parser');
const { getCovidData } = require('./utils');
let nodeGeocoder = require('node-geocoder');
const cc = require('country-state-picker');
var OAuth = require('oauth');                           //Twitter OAuth
var session = require('express-session');


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
app.get("/",(req,res)=>{
    if(req.session.logged == undefined){     //User not logged
        res.render("index",{logged:false});
    }
    
    else if(req.session.user_name == undefined){ 
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
app.get("/login",(req,res)=>{
   //1 step: getting request token
   TwitterOAuth.getOAuthRequestToken((error,oauthRequestToken,oauthRequestTokenSecret)=>{
        const method = 'authorize';
        if(error){
            console.log(error);
        }
        else{
            //2 step: getting authorization from resource owner
            const authorizationUrl =  `https://api.twitter.com/oauth/${method}?oauth_token=${oauthRequestToken}`;
            req.session.logged = true;
            res.redirect(authorizationUrl);
        }
   });
});


//SERV
app.get("/nation", function(req, res) {
    var city = req.originalUrl.split("=")[1];
    var cases;
    var codNat;
    var nat;
    var tweets;
    var tweetsText;

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
                        access_token: req.session.oauth_token,
                        access_token_secret: req.session.oauth_token_secret,
                        //timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
                        strictSSL: true, // optional - requires SSL certificates to be valid.
                    });


                    T.get('search/tweets', { q: city, count: 5 }, function(err, data, response) {
                        //console.log(data);
                        //res.write(JSON.stringify(data));

                        for (let i = 0; i < data.statuses.length; i++) {
                            tweets += JSON.stringify(data.statuses[i]);
                            tweetsText += data.statuses[i].text + " ";
                        }
                        //res.write(tweets);
                        //res.write(tweetsText);
                        //res.end("Ricerca finita");
                    });
                    res.render("home", { city: city, nation: nat.name, covidCases: cases, out: tweetsText });
                }
            });
        })
        .catch((err) => {
            res.render("index", { error: "La città inserita non esiste",logged:req.session.logged,username:req.session.user_name});
        });

});


//Twitter logout
app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.render("index", { logged: false });
});


app.listen(PORT, () => {
    console.log("Applicazione in ascolto sulla porta " + PORT);
});
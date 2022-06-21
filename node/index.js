/***********DIPENDENZE*************/
const express = require('express');
const session = require('express-session')
const path = require('path');
const request = require('request');
const qs = require('querystring');            //Per effettuare parsing delle query URL
var Twit = require('twit');                  //Per gestire le richieste REST di Twitter
require('dotenv').config();                 //Per ricavare i token necessari per OAuth


const PORT = 3000;
const app = express();
const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_CALL_BACK_URL } = process.env;   //Rivavo le credenziali Twitter
const twitterOAuth = {
    callback: TWITTER_CALL_BACK_URL,
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET
}

/******SESSION*****/
app.use(session({
    secret: 'MarcoPoloSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, secure: true } // 1 giorno
}));


//Gestione delle views tramite pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views'));      //Usato per caricare i file statici (css)


/***********ROUTES*************/
//Pagina iniziale
app.get("/",(req,res)=>{
    console.log(req.session.logged);
    if(req.session.logged == undefined){     //La sessione non è settata; l'utente non è loggato
        res.render("index",{logged:false});
    }
    
    else if(req.session.user_name == undefined){     //Devo ancora completare la fase 3 di OAuth
        //3 step : ottenimento token
        const req_data = qs.parse(req);
        var url = "https://api.twitter.com/oauth/access_token?oauth_token="+req.query.oauth_token+"&oauth_verifier="+req.query.oauth_verifier;
        request.post({url:url},(e,r,body)=>{
            const body_data = qs.parse(body);
            req.session.oauth_token = body_data.oauth_token;
            req.session.oauth_token_secret = body_data.oauth_token_secret;
            req.session.user_id = body_data.user_id;
            req.session.user_name = body_data.screen_name;

            //res.render("index",{logged:true,username:req.session.user_name});
            res.end(req.session.user_name);
        });
    }

    else{                                   //L'utente era già loggato
        res.end(req.session.user_name);
    }
    
});


app.get("/login",(req,res)=>{
    //1 step: acquisizione access_token
    var url = "https://api.twitter.com/oauth/request_token";
    request.post({url:url,oauth:twitterOAuth},(e,r,body)=>{
        const req_data = qs.parse(body);
        
        //2 step: autorizzazione resource owner
        url = "https://api.twitter.com/oauth/authorize?oauth_token="+req_data.oauth_token;
        request.get({uri:url},(e,r,body)=>{
            req.session.logged = true;
            console.log(req.session.logged);
            res.end(body);
        });
    });
});

app.listen(PORT,()=>{
    console.log("Applicazione in ascolto sulla porta "+PORT);
});
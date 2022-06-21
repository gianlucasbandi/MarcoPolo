const express = require('express');
const path = require('path');
var request2server = require('request');
const bodyParser = require('body-parser');

const PORT = 3000;
const app = express();


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(__dirname + '/views')); //Usato per caricare i file statici (css)
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index", { logged: false });
});

app.get("/login", (req, res) => {
    res.end("Cisanini");
});

app.get('/nation', function(req, res) {
    var tipo = req.originalUrl.split("=")[1];
    request2server({
        url: 'https://corona.lmao.ninja/v2/countries/' + tipo + '?strict',
        method: 'GET',
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            res.send(response.statusCode + " " + body)
            console.log(response.statusCode, body);
        }
    });;
});

app.listen(PORT, () => {
    console.log("Applicazione in ascolto sulla porta " + PORT);
});
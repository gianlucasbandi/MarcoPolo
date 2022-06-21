const express = require('express')
var request2server = require('request');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/nation', function(req, res) {
    var tipo = 'ita'
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

app.get('/', (req, res) => {
    res.send('Aoh je sta');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
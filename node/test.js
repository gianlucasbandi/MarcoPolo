const request = require('request');

request({
    url: 'https://corona-api.com/countries/IT',
    method: 'GET',
}, function(error, response, body) {
    if (error) {
        res.end(error);
    } else {
        console.log(body.split("{")[7].split(",")[5].split(":")[1]);
    }
});
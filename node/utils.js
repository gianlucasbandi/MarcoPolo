//const { request } = require("chai");
const request = require('request');
let nodeGeocoder = require('node-geocoder');
const e = require('express');
let options = {
    provider: 'openstreetmap',
};

let geoCoder = nodeGeocoder(options);

function isNumeric(str) {
    return /\d/.test(str);
}

var format = /[ `!@#$%^&*()_\-=\[\]{};:"\\|,.<>\/?~]/;

module.exports = {
    getCovidData: function(codNat) {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://corona-api.com/countries/" + codNat }, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body.split("{")[7].split(",")[5].split(":")[1]);
                }
            });
        });
    },

    //Function to get recent tweets posted in a city
    getTweets: function(T, city) {
        return new Promise((resolve, reject) => {
            T.get('search/tweets', { q: city, count: 4, result_type: "recent" }, (err, data, response) => {
                if (err) reject("Search failed");
                resolve(data);
            });
        });
    },

    //Getting the ids of each tweets (json format)
    getTweetsId: function(json_tweets) {
        return new Promise((resolve, reject) => {
            if (json_tweets.statuses.length == 0) reject("No tweets found");
            var res = [];
            for (let i = 0; i < json_tweets.statuses.length; i++) {
                //Pattern : //https://twitter.com/screen_name/status/id Patter da utilizzare
                res[i] = json_tweets.statuses[i].id_str;
            }
            resolve(res);
        });
    },

    getCovidDataItaly: function(region) {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province-latest.json" }, (e, r, body) => {
                if (e) reject(e);

                var data_array = new Array();
                var json_data = JSON.parse(body);

                for (let i = 0; i < json_data.length; i++) {
                    data_array.push(json_data[i]);
                }

                //console.log(region);
                var data = data_array.find(elem => elem.denominazione_regione == region.trim());
                //console.log(data);
                resolve(data.totale_casi);
            });
        });
    },

    getGeoData: function(city) {
        return new Promise((resolve, reject) => {
            if (isNumeric(city) || format.test(city)) reject("La città inserita non esiste");
            else {
                geoCoder.geocode(city)
                    .then((result) => {
                        if (result[0].country == 'Italia') {
                            var reg = result[0].state;
                        } else {
                            var reg = "none";
                        }
                        var out = [result[0].countryCode, result[0].country, reg];
                        resolve(out);
                    })
                    .catch((err) => {
                        reject("La città inserita non esiste");
                    });
            }
        })
    },

    formatCityName: function(city) {
        return new Promise((resolve, reject) => {
            if (city == "") reject("None")
            var temp;
            var out;

            if (city.includes("+")) temp = city.replaceAll('+', ' ');
            else temp = city

            out = temp.split(" ")
            temp = ""
            if (out.length > 1) {
                for (let i = 0; i < out.length; i++) {
                    out[i] = out[i].charAt(0).toUpperCase() + out[i].slice(1).toLowerCase() + " ";
                    if (i == out.length - 1) out[i] = out[i].charAt(0).toUpperCase() + out[i].slice(1).toLowerCase();
                    temp += out[i]
                }
            } else {
                out[0] = out[0].charAt(0).toUpperCase() + out[0].slice(1).toLowerCase();
                temp += out[0]
            }

            resolve(temp);
        });
    }
}
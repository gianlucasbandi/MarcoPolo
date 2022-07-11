//const { request } = require("chai");
require('dotenv').config();
const request = require('request');
const e = require('express');
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const { GOOGLE_MAPS_API_KEY } = process.env;

function isNumeric(str) {
    return /\d/.test(str);
}

var format = /[ `!@#$%^&*()_\-=\[\]{};:"\\|,.<>\/?~]/;

module.exports = {
    getCovidData: function (codNat) {
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
    getTweets: function (T, city) {
        return new Promise((resolve, reject) => {
            T.get('search/tweets', { q: city, count: 4, result_type: "recent", lang: "it" }, (err, data, response) => {
                if (err) reject("Search failed");
                resolve(data);
            });
        });
    },

    //Getting the ids of each tweets (json format)
    getTweetsId: function (json_tweets) {
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

    getCovidDataItaly: function (region) {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni-latest.json" }, (e, r, body) => {
                if (e) reject(e);

                var data_array = new Array();
                var json_data = JSON.parse(body);

                for (let i = 0; i < json_data.length; i++) {
                    data_array.push(json_data[i]);
                }

                //console.log(region);
                var data = data_array.find(elem => elem.denominazione_regione == region.trim());
                //console.log(data);
                resolve(data.nuovi_positivi);
            });
        });
    },

    getGeoData: function (city) {
        return new Promise((resolve, reject) => {
            if (isNumeric(city) || format.test(city)) reject("La città inserita non esiste");
            else {
                client
                    .geocode({
                        params: {
                            address: city,
                            key: GOOGLE_MAPS_API_KEY
                        }
                    })
                    .then((res) => {
                        var lun = res.data.results[0].address_components.length;
                        var add = res.data.results[0].address_components;

                        if (add[lun - 1].types == 'postal_code') {
                          var country = add[lun - 2].long_name;
                          var id = add[lun - 2].short_name;
                          if (country == 'Italy') {
                            var reg = add[lun - 3].long_name;
                          } else {
                            var reg = "none";
                          }
                        } else {
                          var country = add[lun - 1].long_name;
                          var id = add[lun - 1].short_name;
                          if (country == 'Italy') {
                            var reg = add[lun - 2].long_name;
                          } else {
                            var reg = "none";
                          }
                        }

                        var out = [id, country, reg, res.data.results[0].geometry.location.lat, res.data.results[0].geometry.location.lng];
                        resolve(out);
                    })
                    .catch((err) => {
                        reject("La città inserita non esiste " + err);
                    });
            }
        })
    },

    formatCityName: function (city) {
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
    },


    getLessCasesCountry: function () {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://corona-api.com/countries" }, (error, response, body) => {
                if (error) reject(error);
                //console.log(body);
                var minCases;
                var data = new Array();
                var json_body = JSON.parse(body);
                minCases = json_body.data[0].latest_data.confirmed;
                for (let i = 0; i < json_body.data.length; i++) {
                    data.push(json_body.data[i]);
                    if (json_body.data[i].latest_data.confirmed < minCases) minCases = json_body.data[i].latest_data.confirmed;
                }
                var result = data.find(element => element.latest_data.confirmed == minCases);

                resolve(result.name);

            });
        });
    },

    getLessCasesItalianRegion: function () {
        return new Promise((resolve, reject) => {
            request.get({ url: "https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni-latest.json" }, (e, r, body) => {
                if (e) reject(e);

                var data_array = new Array();
                var json_data = JSON.parse(body);
                var minCases = json_data[0].nuovi_positivi;

                for (let i = 0; i < json_data.length; i++) {
                    data_array.push(json_data[i]);
                    if (data_array[i].nuovi_positivi < minCases) minCases = data_array[i].nuovi_positivi;
                }

                var result = data_array.find(elem => elem.nuovi_positivi == minCases);
                //console.log(data);
                resolve(result.denominazione_regione);
            });
        });
    }
}
//const { request } = require("chai");
const request = require('request');

module.exports = {
    getCovidData: function(json_string) {
        var spl = json_string.split(",");
        var elem = spl.find(el => el.includes("todayCases"));
        return elem.split(":")[1];
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

                var data = data_array.find(elem => elem.denominazione_regione == region);
                //console.log(data);
                resolve(data.totale_casi);
            });
        });
    }
}
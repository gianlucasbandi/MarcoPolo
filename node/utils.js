//const { request } = require("chai");
const request = require('request');

module.exports = {
    getCovidData: function(json_string) {
        var spl = json_string.split(",");
        var elem = spl.find(el => el.includes("todayCases"));
        return elem.split(":")[1];
    },

    //Function to get recent tweets posted in a city
    getTweets: function(T,city){
        return new Promise((resolve,reject)=>{
            T.get('search/tweets',{q:city,count:4,result_type:"recent"},(err,data,response)=>{
                if(err)reject("Search failed");
                resolve(data);
            });
        });
    },

    //Getting the ids of each tweets (json format)
    getTweetsId: function(json_tweets){
        return new Promise((resolve,reject)=>{
            if(json_tweets.statuses.length == 0)reject("No tweets found");
            var res = [];
            for(let i = 0;i<json_tweets.statuses.length;i++){
                //Pattern : //https://twitter.com/screen_name/status/id Patter da utilizzare
                res[i] = json_tweets.statuses[i].id_str;
            }
            resolve(res);
        });
    }
}
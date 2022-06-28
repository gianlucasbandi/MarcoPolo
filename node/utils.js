const { request } = require("chai");

module.exports = {
    getCovidData: function(json_string) {
        var spl = json_string.split(",");
        var elem = spl.find(el => el.includes("todayCases"));
        return elem.split(":")[1];
    },

    //Function to get recent tweets posted in a city
    getTweets: function(T,city){
        return new Promise((resolve,reject)=>{
            T.get('search/tweets',{q:city,count:5},(err,data,response)=>{
                if(err)reject("Search failed");
                resolve(data);
            });
        });
    },

    //Getting the urls of each tweets (json format)
    getTweetsUrl: function(json_tweets){
        return new Promise((resolve,reject)=>{
            if(json_tweets.statuses.length == 0)reject("No tweets found");
            var res = [];
            for(let i = 0;i<json_tweets.statuses.length;i++){
                //Pattern : //https://twitter.com/screen_name/status/id Patter da utilizzare
                res[i] = "https://twitter.com/"+json_tweets.statuses[i].user.screen_name+"/status/"+json_tweets.statuses[i].id_str;
            }
            resolve(res);
        });
    }
}
module.exports = {
    getCovidData: function(json_string) {
        var spl = json_string.split(",");
        var elem = spl.find(el => el.includes("todayCases"));
        return elem.split(":")[1];
    }
}
module.exports = {
    setCookie: function(name, value, res) {
        res.cookie(name, value, {
            maxAge: 60 * 60 * 24, //Durata di un giorno
            secure: true,
            httpOnly: true,
            sameSite: 'lax' //Blocca il cross-site request
        });
    },

    getCovidData: function(json_string) {
        var spl = json_string.split(",");
        if (spl[0] === '{"message"') return -1;
        var elem = spl.find(el => el.includes("todayCases"));
        return elem.split(":")[1];
    }
}
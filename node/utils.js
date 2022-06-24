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

    }
}
const cc = require('country-state-picker');
let nodeGeocoder = require('node-geocoder');

let options = {
    provider: 'openstreetmap',
};


let geoCoder = nodeGeocoder(options);

geoCoder.geocode('roma')
    .then((result) => {
        var out = (result[0].formattedAddress + "," + result[0].countryCode).split(",");
        var codNat = out[4];
        var nat = out[3];
        var reg = out[2];
        console.log(codNat, nat, reg);
    })
    .catch((err) => {
        res.render("index", { error: "La città inserita non esiste" });
    });
let nodeGeocoder = require('node-geocoder');
let options = {
    provider: 'openstreetmap',
};

let geoCoder = nodeGeocoder(options);

geoCoder.geocode('Roma')
    .then((result) => {
        console.log(result)
    })
    .catch((err) => {
        console.log("La città inserita non esiste");
    });
let nodeGeocoder = require('node-geocoder');

let options = {
    provider: 'openstreetmap',
};

let geoCoder = nodeGeocoder(options);
geoCoder.geocode('roma')
    .then((res) => {
        console.log(res);
        console.log(res[0].country);
        console.log(res[0].latitude);
        console.log(res[0].longitude);
    })
    .catch((err) => {
        console.log(err);
    });
geoCoder.geocode(city)
    .then((result) => {
        if (result[0].country == 'Italia') {
            var reg = result[0].state;
        } else {
            var reg = "none";
        }
        var out = [result[0].countryCode, result[0].country, reg];
        resolve(out);
    })
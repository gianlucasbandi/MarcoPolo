function initMap() {
  var location;
  var city = req.originalUrl.split("=")[1];
  console.log(city);
  getGeoData(city)
            .then(result => {
                location = result[3];
                console.log(location);
            })
            .catch(err => {
                cityErr = true;
            })
  var div_map = document.getElementById('map');
    const map = new google.maps.Map(div_map, {
      zoom: 10,
      center: location,
    });

  }
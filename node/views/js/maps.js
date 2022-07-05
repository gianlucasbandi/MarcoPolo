function initMap() {
    // The location
    const location = { lat: 41.9100711, lng: 12.5359979 };
    // The map, centered at location
    const map = new google.maps.Map(document.getElementById("maps"), {
      zoom: 10,
      center: location,
    });
    // The marker, positioned at location
    const marker = new google.maps.Marker({
      position: { lat: 41.9100711, lng: 12.5359979 },
      map: map,
    });
  }
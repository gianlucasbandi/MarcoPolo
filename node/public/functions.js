// Initialize and add the map
function initMap() {
    // The location
    const location = { lat: 41.9100711, lng: 12.5359979 };
    // The map, centered at location
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: location,
    });
    // The marker, positioned at location
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
  }
  
  window.initMap = initMap;
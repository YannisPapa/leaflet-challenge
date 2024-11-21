// Store our API endpoint as queryUrl.
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function markerSize(mag) {
    return mag * 10000;
}

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(eqData) {

    // Define arrays to hold the created city and state markers.
    let eqMarkers = [];
    let color = '#42ff00' // green
    
    // Loop through locations, and create the city and state markers.
    for (let i = 0; i < eqData.length; i++) {
        if (eqData[i].geometry.coordinates[2] >= 90) {
            color = '#ff0000' // red
        } else if (eqData[i].geometry.coordinates[2] >= 70) {
            color = '#ff7400' // orangy red
        } else if (eqData[i].geometry.coordinates[2] >= 50) {
            color = '#ffaa00' // orange
        } else if (eqData[i].geometry.coordinates[2] >= 30) {
            color = '#fffb00' // yellow
        } else if (eqData[i].geometry.coordinates[2] >= 10) {
            color = '#d1ff00' // yellowish green
        } else {
            color = '#42ff00'
        }
        // Set the marker radius for the state by passing the population to the markerSize() function.
        eqMarkers.push(
            L.circle([eqData[i].geometry.coordinates[1],eqData[i].geometry.coordinates[0]], {
                fillOpacity: 0.75,
                weight:0.5,
                color: "black",
                fillColor: color,
                radius: markerSize(eqData[i].properties.mag)
            })
        );
    }

    // Send our earthquakes layer to the createMap function/
    createMap(eqMarkers);
}

function createMap(eqMarkers) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let eqLayer = L.layerGroup(eqMarkers);

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: eqLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, eqLayer]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
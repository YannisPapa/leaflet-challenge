// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to calculate what marker radius should be based on magnitude
function markerSize(mag) {
  return mag * 10000;
}

// Function to figure out what marker color should be based on depth
function getColor(depth) {
  if (depth >= 90) {
    color = '#ff0000' // red
  } else if (depth >= 70) {
    color = '#ff7400' // orangy red
  } else if (depth >= 50) {
    color = '#ffaa00' // orange
  } else if (depth >= 30) {
    color = '#fffb00' // yellow
  } else if (depth >= 10) {
    color = '#d1ff00' // yellowish green
  } else {
    color = '#42ff00' // green
  }
  return color
}

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(eqData) {

  // Define arrays to hold the earthquake markers.
  let eqMarkers = [];
  
  // Loop through locations, and create the earthquake markers.
  for (let i = 0; i < eqData.length; i++) {

    // Variables to be used below
    let depth = eqData[i].geometry.coordinates[2];
    let magnitude = eqData[i].properties.mag;
    let lat = eqData[i].geometry.coordinates[1];
    let lng = eqData[i].geometry.coordinates[0];
    let place = eqData[i].properties.place
    let time = new Date(eqData[i].properties.time)

    // Creat circle marker, set the marker radius by passing magnitude to the markerSize() function, add a bindpopup for each marker
    eqMarkers.push(
      L.circle([lat,lng], {
        fillOpacity: 0.75,
        weight:0.5,
        color: "black",
        fillColor: getColor(depth),
        radius: markerSize(magnitude)
      }).bindPopup(`<h3>${place}</h3><hr><p>${time}</p><p>Magnitude: ${magnitude}</p><p>Depth: ${depth}</p><p>Location: [${lat}, ${lng}]</p>`)
    );
  }

  // Send our earthquakes layer to the createMap function
  createMap(eqMarkers);
}

function createMap(eqMarkers) {

  // Create the base layers
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create topography layer
  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let eqLayer = L.layerGroup(eqMarkers);

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay
  var overlayMaps = {
    Earthquakes: eqLayer
  };

  // Create our map, giving it layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, eqLayer]
  });

  // Create a layer control, Pass it our baseMaps and overlayMaps, Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend
  let legend = L.control({ position: 'bottomright' });

  // Add elemtnes to the legend, adds numbers and colored squares
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // make sure legend has a white backround and some padding
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.borderRadius = '5px';

    // Loop through our density intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(grades[i]) + '"></i> ' + grades[i] + (grades[i + 1] ? '-' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

}
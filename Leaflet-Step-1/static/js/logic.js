// Store API
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function size(magnitude) {
  return magnitude * 40000;
}

function colors(magnitude) {
  var color = "";
  if (magnitude <= 1) {
    return color = "#83FF00";
  }
  else if (magnitude <= 2) {
    return color = "#FFEC00";
  }
  else if (magnitude <= 3) {
    return color = "#ffbf00";
  }
  else if (magnitude <= 4) {
    return color = "#ff8000";
  }
  else if (magnitude <= 5) {
    return color = "#FF4600";
  }
  else if (magnitude > 5) {
    return color = "#FF0000";
  }
  else {
    return color = "#ff00bf";
  }
}

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {

  console.log(data.features);

  createFeatures(data.features);

});

function createFeatures(earthquakeData) {

  console.log(earthquakeData[0].geometry.coordinates[1]);
  console.log(earthquakeData[0].geometry.coordinates[0]);
  console.log(earthquakeData[0].properties.mag);

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<hr> <p> Earthquake Magnitude: " + feature.properties.mag + "</p>")
  }

  var earthquakes = L.geoJSON(earthquakeData, {

    onEachFeature: onEachFeature,

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    pointToLayer: function (feature, coordinates) {
      // Determine marker colors, size, and opacity for each earthquake.
      var geoMarkers = {
        radius: size(feature.properties.mag),
        fillColor: colors(feature.properties.mag),
        fillOpacity: 0.30,
        stroke: true,
        weight: 1
      }
      return L.circle(coordinates, geoMarkers);
    }
  })

  createMap(earthquakes);
}

// Create function for earthquake map
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoormap,
    "Grayscale Map": grayscalemap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };


  // Create map
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoormap, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  // Create a legend
  var legend = L.control({ 
    position: 'bottomright' 
  });

  legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5];

    for (var i = 0; i < magnitude.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }

    return div;
  };


  legend.addTo(myMap);

}
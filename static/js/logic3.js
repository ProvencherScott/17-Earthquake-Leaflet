// Create the three tile layers to be displayed on the map
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    // add attribution for copyright
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
});
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
});
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
});

// We then create the map object with options. Adding the tile layers we just created to an array of layers.
var map = L.map("map", {
  center: [
    0.0, 25.0],
  zoom: 2,
  layers: [satellitemap, graymap, outdoors]
});

let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";


// Earthquake layer
  var earthquakes = new L.LayerGroup();

// Define a baseMap object to hold layers
var baseMaps = {
  Satellite: satellitemap,
  Graymap: graymap,
  Outdoors: outdoors
};

// Create overlay object to hold overlay layer
var overlayMaps = {
  // "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Add a control to select a layer
L.control.layers(baseMaps, overlayMaps, {collapsed: false})
  .addTo(map);

// Perform get request to retrieve Geojson data
d3.json(earthquakeUrl, function(data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Create a function for color scale to show the depth of the earthquake. Earthquakes darker in color have a higher depth
  function markerColor(depth) {
    switch (true) {
    case depth > 90:
      return "#fc1a1a";
    case depth > 70:
      return "#ff7b00";
    case depth > 50:
      return "#ffe500";
    case depth > 30:
      return "#90c60a";
    case depth > 10:
      return "#7df318";
    default:
      return "#7df318";
    }
  }

// Create a function for radius of the earthquake. Earthquakes with a wider circle have a higher magnitude
function getRadius(magnitude) {
    if (magnitude === 0) {
        return 1;
    }
    return magnitude * 4;
}

// Here we add a GeoJSON layer to the map once the file is loaded
L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of
    // the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "Magnitude: "
          + feature.properties.mag
          + "<br>Depth: "
          + feature.geometry.coordinates[2]
          + "<br>Location: "
          + feature.properties.place
      );
    }
    // We add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(map);

  // Here we create a legend control object.
  var legend = L.control({
    position: "bottomright"
  });

  legend.addTo(map);

})

var selection = document.getElementById("selection");
var map = L.map("map").setView([-20.91093577199996, 55.40255007600007], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let geoJsonLayers = []; // Array to store GeoJSON layers

fetch("./CITALISLIGNE.geojson")
  .then((response) => response.json())
  .then((data) => {
    let ligne = data.features.map(
      (feature) => feature.properties.N_Ligne.split("Ligne ")[1]
    );
    ligne.sort((a, b) => parseInt(a) - parseInt(b));

    for (let indexa = 0; indexa < data.features.length; indexa++) {
      selection.innerHTML += "<option> Ligne " + ligne[indexa] + "</option>";
    }

    let ensembleUnique = new Set();
    for (let index = 0; index < data.features.length; index++) {
      let couleur = "#" + Math.floor(Math.random() * 16777215).toString(16);

      if (!ensembleUnique.has(couleur)) {
        ensembleUnique.add(couleur);

        let geoJsonLayer = L.geoJSON(data.features[index], {
          style: {
            color: couleur,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.2,
          },
        }).addTo(map);

        geoJsonLayers.push({
          layer: geoJsonLayer,
          nLigne: data.features[index].properties.N_Ligne,
          defaultStyle: {
            color: couleur,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.2,
          },
        });
      }
    }
  });

let busStopGeoJsonLayers = []; // Array to store second set of GeoJSON layers

fetch("./CITALISARRET.geojson")
  .then((response) => response.json())
  .then((data) => {
    for (let indexa = 0; indexa < data.features.length; indexa++) {
      let busStopGeoJsonLayer = L.geoJSON(data.features[indexa], {
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: "blue", // Change the fill color for the markers
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          });
        },
      }).addTo(map);

      busStopGeoJsonLayers.push({
        layer: busStopGeoJsonLayer,
        defaultStyle: {
          fillColor: "blue",
          color: "black",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        },
        nLigne: data.features[indexa].properties.N_Ligne, // Add nLigne here
      });
    }
  });

// Function to change the style of a specific GeoJSON layer for bus lines
function changeBusLineStyle(selectedOption) {
  geoJsonLayers.forEach((layer) => {
    if (layer.nLigne.includes(selectedOption)) {
      // Change the style for the selected bus line in bus stops
      layer.layer.setStyle({
        color: "red",
        weight: 2,
        opacity: 1,
      });
    } else {
      // Hide other bus stops by setting the opacity to 0
      layer.layer.setStyle({ opacity: 0 });
    }
  });
}

// Function to change the style of a specific GeoJSON layer for bus stops
function changeBusStopStyle(selectedOption) {
  busStopGeoJsonLayers.forEach((layer) => {
    const busLines = layer.nLigne.split(", ").map((line) => line.trim());
    if (busLines.includes(selectedOption)) {
      // Change the style for the selected bus line in bus stops
      layer.layer.setStyle({
        fillColor: "red", // Change this to the desired style
        color: "black",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      });
    } else {
      // Reset the style to the default style for other bus stops
      layer.layer.setStyle({ opacity: 0,
      fillOpacity:0 });
    }
  });
}

// Attach the changeBusLineStyle and changeBusStopStyle functions to the change event of the select element
selection.addEventListener("change", function () {
  let selectedOption = this.value;
  changeBusLineStyle(selectedOption);
  changeBusStopStyle(selectedOption);
});

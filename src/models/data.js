// The Model for my personal contact information
var ContactInfo = {
  first_name: "Wolfgang",
  last_name: "Stöttinger",
  email: "wolfgang.stoettinger@gmail.com"
};

// the data for all markers to show on the map
var mapData = [{
  title: "Here",
  address: "Zimmermanngasse 11, 1090 Wien",
  region: "Austria",
  type: "private"
}, {
  title: "There",
  address: "Margaretenstraße 52, 1040 Wien",
  region: "Austria",
  type: "private"
}, {
  title: "Vienna University of Business and Economics",
  address: "Welthandelsplatz 1, 1020 Wien",
  region: "Austria",
  type: "public"
}];

var settings = {

  mapStyle: [{
    "stylers": [{
      "visibility": "simplified"
    }, {
      "saturation": -32
    }, {
      "hue": "#66ff00"
    }]
  }, {
    "featureType": "landscape.man_made",
    "stylers": [{
      "visibility": "off"
    }]
  }, {
    "featureType": "poi.business",
    "stylers": [{
      "visibility": "off"
    }]
  }],

  mapOptions: {
    center: {
      lat: 48.2146767,
      lng: 16.406435800000054
    },
    zoom: 13
  },

  markerIcons: {
    //https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=Z&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1
    "private": "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&psize=11&font=fonts/Roboto-Regular.ttf&color=3279D1&ax=44&ay=48&scale=1",
    "public": "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1"
  }
};
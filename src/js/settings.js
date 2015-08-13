'use strict';

var settings = {

  searchOptions: {
    typeOptions: [{
      $id: "pac-all",
      $type: "ckeckbox",
      $checked: true,
      $label: "All",
      searchTypes: []
    }, {
      $id: "pac-cafes",
      $type: "ckeckbox",
      $checked: true,
      $label: "Cafés",
      searchTypes: ["cafe"]
    }, {
      $id: "pac-bars",
      $type: "ckeckbox",
      $checked: true,
      $label: "Bars",
      searchTypes: ["bar"]
    }, {
      $id: "pac-restaurants",
      $type: "ckeckbox",
      $checked: true,
      $label: "Restaurants",
      searchTypes: ["restaurant"]
    }, {
      $id: "pac-clubs",
      $type: "ckeckbox",
      $checked: true,
      $label: "Clubs",
      searchTypes: ["night_club"]
    }],
    types: [],
    maxPriceLevel: 4,
    minPriceLevel: 0,
    openNow: false
  },

  // the settings for the google maps api.
  map: {

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
      zoom: 13,
      panControl: false,
      rotateControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.DEFAULT,
        position: google.maps.ControlPosition.RIGHT_CENTER
      }
    },

    markerIcons: {
      //https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=Z&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1
      "private": "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-b.png&psize=11&font=fonts/Roboto-Regular.ttf&color=3279D1&ax=44&ay=48&scale=1",
      "public": "https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&psize=11&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1"
    }
  }
};

module.exports = settings;
'use strict';

var data = {

  // the data for all markers to show on the map
  mapData: [{
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
  }],

  searchResults: [{
    "geometry": {
      "bounds": {
        "Ia": {
          "G": 48.2146941,
          "j": 48.214757
        },
        "Ca": {
          "j": 16.353895800000032,
          "G": 16.35389829999997
        }
      },
      "viewport": {
        "Ia": {
          "G": 48.2133765697085,
          "j": 48.2160745302915
        },
        "Ca": {
          "j": 16.35254806970852,
          "G": 16.355246030291482
        }
      }
    },
    "icon": "http://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
    "id": "33d0030850a614a8f19281d047c90e27f950a19b",
    "name": "Edison",
    "opening_hours": {
      "open_now": true,
      "weekday_text": []
    },
    "photos": [{
      "height": 1365,
      "html_attributions": ["<a href=\"https://www.google.com/maps/views/profile/113500132060505623166\">Edison</a>"],
      "width": 2048
    }],
    "place_id": "ChIJPRjOjr8HbUcRmMZloblE6OU",
    "rating": 4.2,
    "reference": "CmRaAAAAeHwWdfdurBce8H42kdDODCrkrrzwV8aeAFTxEVQlRgGUwE42OS5asJ235QB69NV-DLa7PqAMoUC3hgNCTSqtT4CFH7ol--ey1kKx8jqQnAt0BUBYzVcQ3C-Ve4nemLlnEhAIsq_-mlXSCQg6-n5tvN3KGhRoUIgyzYluJ_AW_c6Xsg7MzdKmCw",
    "scope": "GOOGLE",
    "types": ["restaurant", "bar", "food", "point_of_interest", "establishment"],
    "vicinity": "Alser Straße 9, Wien",
    "html_attributions": [],
    "address_components": [{
      "long_name": "9",
      "short_name": "9",
      "types": ["street_number"]
    }, {
      "long_name": "Alser Straße",
      "short_name": "Alser Str.",
      "types": ["route"]
    }, {
      "long_name": "Alservorstadt",
      "short_name": "Alservorstadt",
      "types": ["neighborhood", "political"]
    }, {
      "long_name": "Josefstadt",
      "short_name": "Josefstadt",
      "types": ["sublocality_level_1", "sublocality", "political"]
    }, {
      "long_name": "Wien",
      "short_name": "Wien",
      "types": ["locality", "political"]
    }, {
      "long_name": "Wien",
      "short_name": "Wien",
      "types": ["administrative_area_level_1", "political"]
    }, {
      "long_name": "Österreich",
      "short_name": "AT",
      "types": ["country", "political"]
    }, {
      "long_name": "1080",
      "short_name": "1080",
      "types": ["postal_code"]
    }],
    "formatted_address": "Edison, Alser Straße 9, 1080 Wien, Österreich"
  }],

  locations: [{
    title: "Cafe Ansari",
    place: {
      name: "Cafe Ansari",
      address: {
        street: "Praterstrasse 15",
        zip: "1020",
        city: "Wien"
      },
      position: {
        lat: "48.213351",
        lng: "16.381565"
      },
      contact: {
        phone: "+43 1 2765102",
        internet: "www.cafeansari.at",
      },
      open: [{
        days: "Mo-Sa",
        hours: "08:00-23:00"
      }, {
        days: "So",
        hours: "09:00-15:00"
      }]
    },
    images: [{
      photo_title: "Cafe Ansari",
      photo_file_url: "https://lisileon.files.wordpress.com/2015/06/ansari.jpg",
      photo_url: "https://lisileon.wordpress.com/2015/06/19/cafe-ansari/",
      owner_name: "unknown",
      owner_url: "",
      width: 620,
      height: 417,
      latitude: "48.213351",
      longitude: "16.381565",
      upload_date: "14 April 2008"
    }],
    description: "Das Cafe Ansari in der Praterstraße ist der perfekte Ort für ein ausgedehntes Frühstück, Mittagessen, Abendessen oder einfach so zum Kaffee. Die Inneneinrichtung ist modern und gemütlich zugleich und kleine Eyecatcher, wie etwa die handgemachten Kacheln, oder auch die täglich frischen Blumen auf den Tischen, verleihen dem Lokal das gewisse Etwas. Was das Kulinarische betrifft, so findet man im Ansari neben interessanten Frühstücksvariationen, wie etwa das russische oder georgische Frühstück, auch köstliche Antipasti, originelle Vorspeisen und eine umfangreiche Hauptspeisenkarte. Und spätestens nach der Créme Brulée oder dem lauwarmen Schokokuchen plant man bereits den nächsten Lokalbesuch.",
    types: ["cafe", "bar", "restaurant"],
    tags: ["breakfast", "dinner", "lunch", "1020"],
    visited: true,
    review: {
      price: "€€",
      value4money: 3,
      atmosphere: 4,
      friendlyness: 4,
      speed: 4,
    }
  }]
};

module.exports = data;
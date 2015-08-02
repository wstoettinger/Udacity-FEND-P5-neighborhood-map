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
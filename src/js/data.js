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

  bla: [{
    "address_components": [{
      "long_name": "15",
      "short_name": "15",
      "types": ["street_number"]
    }, {
      "long_name": "Praterstraße",
      "short_name": "Praterstraße",
      "types": ["route"]
    }, {
      "long_name": "Leopoldstadt",
      "short_name": "Leopoldstadt",
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
      "long_name": "1020",
      "short_name": "1020",
      "types": ["postal_code"]
    }],
    "adr_address": "<span class=\"street-address\">Praterstraße 15</span>, <span class=\"postal-code\">1020</span> <span class=\"locality\">Wien</span>, <span class=\"country-name\">Österreich</span>",
    "formatted_address": "Praterstraße 15, 1020 Wien, Österreich",
    "formatted_phone_number": "01 2765102",
    "geometry": {
      "location": {
        "G": 48.213362,
        "K": 16.381574
      }
    },
    "icon": "https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png",
    "id": "01d2fbb73620d5621c082fbbee3077f30348ec9f",
    "international_phone_number": "+43 1 2765102",
    "name": "Café Ansari",
    "opening_hours": {
      "open_now": true,
      "periods": [{
        "close": {
          "day": 0,
          "time": "1500",
          "hours": 15,
          "minutes": 0,
          "nextDate": 1439730000000
        },
        "open": {
          "day": 0,
          "time": "0900",
          "hours": 9,
          "minutes": 0,
          "nextDate": 1439708400000
        }
      }, {
        "close": {
          "day": 1,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1439847000000
        },
        "open": {
          "day": 1,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1439791200000
        }
      }, {
        "close": {
          "day": 2,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1439933400000
        },
        "open": {
          "day": 2,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1439877600000
        }
      }, {
        "close": {
          "day": 3,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1440019800000
        },
        "open": {
          "day": 3,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1439964000000
        }
      }, {
        "close": {
          "day": 4,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1439501400000
        },
        "open": {
          "day": 4,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1440050400000
        }
      }, {
        "close": {
          "day": 5,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1439587800000
        },
        "open": {
          "day": 5,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1439532000000
        }
      }, {
        "close": {
          "day": 6,
          "time": "2330",
          "hours": 23,
          "minutes": 30,
          "nextDate": 1439674200000
        },
        "open": {
          "day": 6,
          "time": "0800",
          "hours": 8,
          "minutes": 0,
          "nextDate": 1439618400000
        }
      }],
      "weekday_text": ["Montag: 08:00–23:30", "Dienstag: 08:00–23:30", "Mittwoch: 08:00–23:30", "Donnerstag: 08:00–23:30", "Freitag: 08:00–23:30", "Samstag: 08:00–23:30", "Sonntag: 09:00–15:00"]
    },
    "photos": [{
      "height": 1363,
      "html_attributions": ["<a href=\"https://www.google.com/maps/views/profile/110921168312797197410\">Café Ansari</a>"],
      "width": 2048
    }, {
      "height": 1365,
      "html_attributions": ["<a href=\"https://www.google.com/maps/views/profile/110921168312797197410\">Café Ansari</a>"],
      "width": 2048
    }, {
      "height": 1363,
      "html_attributions": ["<a href=\"https://www.google.com/maps/views/profile/110921168312797197410\">Café Ansari</a>"],
      "width": 2048
    }, {
      "height": 1365,
      "html_attributions": ["<a href=\"https://www.google.com/maps/views/profile/110921168312797197410\">Café Ansari</a>"],
      "width": 2048
    }],
    "place_id": "ChIJ0wH4BwoHbUcROe9cFXZUiXI",
    "rating": 4.5,
    "reference": "CmRfAAAA8OrG-b55y4A46Y1pZelylZjwdlJYRqXRVnN_lazr9y4aIoBVoMYfh8CrjTlzr92UkO0oYIt4COa8CYtCt5cIrdn8qaRB8ImajKG-QbwHLLSnJKOsRZhDwf1Tt1azLW8hEhDTLlUpbNw0bcfrDqiMLoIgGhQAXkJ5aw0sxAIn2KR4BxXEe8rQ1Q",
    "reviews": [{
      "aspects": [{
        "rating": 2,
        "type": "overall"
      }],
      "author_name": "Helmut Hackl",
      "author_url": "https://plus.google.com/101314728207236476698",
      "language": "de",
      "rating": 4,
      "text": "Das Cafe Ansari ist ein schickes Lokal, wo es nicht nur Kaffee und angenehme Musik gibt, sondern auch diverse Frühstücks-Variationen. Wenn das Wetter passt, dann lässt es sich gemütlich im Freien entspannen.\n\nIch habe mich heute fürs georgisches Frühstück entschieden. Mit Adscharisches Khatschapuri (Germteigfladen mit Käsefüllung und Spiegelei), Kirsch-Tomaten-Salat mit rotem Basilikum-Dressing und frischen Kräutern (ca. 20 Minuten Wartezeit einkalkulieren). War köstlich und sättigend, aber mit fast 10 Euro doch überteuert.\n\nEin paar Worte zum Kaffee. Der kommt von Fürth Kaffee Wien. Als Cappuccino (3,30 Euro) hat er mir gemundet, als Espresso (2,30 Euro) war er mir zu bitter.",
      "time": 1427976157
    }, {
      "aspects": [{
        "rating": 2,
        "type": "overall"
      }],
      "author_name": "Da. K.",
      "author_url": "https://plus.google.com/114912467055292472157",
      "language": "de",
      "rating": 4,
      "text": "Exzellent...",
      "time": 1432375712
    }, {
      "aspects": [{
        "rating": 3,
        "type": "overall"
      }],
      "author_name": "Charlotte Str",
      "author_url": "https://plus.google.com/103200486362923583644",
      "language": "de",
      "rating": 5,
      "text": "Eines meiner Lieblingslokale. Supet essen zu jeder Tageszeit inkl Frühstück.  Sehr nettes Ambiente.  Service ist immer nett aber unterschiedlich fit.",
      "time": 1399485740
    }, {
      "aspects": [{
        "rating": 3,
        "type": "overall"
      }],
      "author_name": "Christian JIRoUT",
      "author_url": "https://plus.google.com/114095226351762510125",
      "language": "de",
      "rating": 5,
      "text": "Teuer aber jeden Cent wert. Qualität an Service und Speisen kostet halt ! Im Gastgarten kommt Urlaubsfeeling mitten in Wien auf. KRITIK: Keine!",
      "time": 1403180728
    }, {
      "aspects": [{
        "rating": 1,
        "type": "overall"
      }],
      "author_name": "Sebastian Haiss",
      "author_url": "https://plus.google.com/106298049879722757420",
      "language": "de",
      "rating": 3,
      "text": "Guter Mix aus georgischer und libanesischer Küche + stilvolle Einrichtung. Bester Hummus den ich bis jetzt gegessen habe. Top!",
      "time": 1352031608
    }],
    "scope": "GOOGLE",
    "types": ["restaurant", "food", "point_of_interest", "establishment"],
    "url": "https://plus.google.com/110921168312797197410/about?hl=de",
    "user_ratings_total": 22,
    "utc_offset": 120,
    "vicinity": "Praterstraße 15, Wien",
    "website": "http://www.cafeansari.at/",
    "html_attributions": []
  }],

  recommendations: {
    "ChIJ0wH4BwoHbUcROe9cFXZUiXI": {
      place_id: "ChIJ0wH4BwoHbUcROe9cFXZUiXI",
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
    }
  }
};

module.exports = data;
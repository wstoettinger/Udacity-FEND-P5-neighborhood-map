'use strict';

// load necessary files using browserify
var settings = require('./settings.js');
var data = require('./data.js');
var ko = require('knockout');
ko.mapping = require('knockout.mapping');

var Cookies = require('js-cookie');
var Mousetrap = require('../lib/mousetrap.min.js');

var model, map, geocoder, places, autocomplete, infoWindow, marker, markers = [],
  selectedPlace, recommended = {},
  width, pagination;

//
// constructor of the viewmodel, called before the google maps api is loaded asynchronously
//
function ViewModel() {
  model = this;

  //
  // Search
  //
  model.searchInput = ko.observable();
  model.searchOptions = ko.mapping.fromJS(settings.searchOptions);

  // extender which recalculates the types array each time a checkbox changes.
  // note: this is currently not used
  ko.extenders.updateTypes = function (target, searchOptions) {

    target.subscribe(function (newValue) {

      var checkedTypes = [];
      var o = searchOptions.typeOptions();
      for (var i = 0, len = o.length; i < len; i++) {
        var item = o[i];
        if (item.$checked())
          checkedTypes = checkedTypes.concat(item.searchTypes());
      }
      searchOptions.types(checkedTypes.filter(function (value, index, self) {
        return self.indexOf(value) === index;
      }));
    });

    return target;
  };

  // load the place types for search options
  // note: this is currently not used
  var o = model.searchOptions.typeOptions();
  for (var i = 0, len = o.length; i < len; i++) {
    // everytime a checkbox gets checkt, the updateTypes extender is called
    o[i].$checked = o[i].$checked.extend({
      updateTypes: model.searchOptions
    });
  }

  //
  // Search results
  //
  model.searchResults = ko.observableArray();
  model.selectedPlace = ko.observable();

  model.resultsCount = ko.computed(function () {
    return this.searchResults().length;
  }, model);

  // load additional recommendations from cookies

  var storedPlaceIDs = Cookies.getJSON('placeIDs');
  if (storedPlaceIDs)
    for (var i = 0; i < storedPlaceIDs.length; i++) {
      var placeID = storedPlaceIDs[i];
      var place = Cookies.getJSON(placeID);
      if (place)
        data.recommendations[place.place_id] = place;
    }

  //
  // Recommended Places
  //
  recommended.all = getRecommendations();
  recommended.cafes = getRecommendations('cafe');
  recommended.bars = getRecommendations('bar');
  recommended.restaurants = getRecommendations('restaurant');
  recommended.clubs = getRecommendations('night_club');
}

//
// called after the google maps api is fully loaded
//
ViewModel.prototype.initialize = function () {

  // save the window width for responsive behaviour
  width = $(window).width();
  $(window).resize(function () {
    width = $(window).width();
  });

  // extend the loaded settings for the map_style
  settings.map.mapOptions.mapTypeControlOptions = {
    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
  };
  // create the actual map object
  map = new google.maps.Map(document.getElementById('map-canvas'), settings.map.mapOptions);

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', new google.maps.StyledMapType(settings.map.mapStyle, {
    name: 'Styled Map'
  }));
  map.setMapTypeId('map_style');

  // push the panels to the map object
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('search-panel'));

  if (width <= 480) // responsive results panel:
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('results-panel'));
  else
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('results-panel'));

  // associate the autocomplete instance to the search box
  autocomplete = new google.maps.places.Autocomplete(document.getElementById('pac-search'));

  autocomplete.bindTo('bounds', map);

  // instantiate the geocoder
  geocoder = new google.maps.Geocoder();
  // instantiate the places service
  places = new google.maps.places.PlacesService(map);

  // instantiate an InfoWindow
  infoWindow = new google.maps.InfoWindow();

  // initalize the single marker
  marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP
  });

  // add event listeners
  google.maps.event.addListener(autocomplete, 'place_changed', placeChanged);
  google.maps.event.addListener(map, 'click', mapClicked);
  google.maps.event.addListener(marker, 'click', markerClicked);
  google.maps.event.addListener(infoWindow, 'closeclick', infoWindowClosed);

  $('#rec-all').click(recommended.all, recClicked);
  $('#rec-cafes').click(recommended.cafes, recClicked);
  $('#rec-bars').click(recommended.bars, recClicked);
  $('#rec-restaurants').click(recommended.restaurants, recClicked);
  $('#rec-clubs').click(recommended.clubs, recClicked);

  $('#clear-results').click(function () {
    clearSearchResults();
    google.maps.event.trigger(map, 'resize');
  });

  // keyboard shortcut to jump to search input box
  Mousetrap.bind(['command+f', 'ctrl+f'], function (e) {
    document.getElementById('pac-search').focus();
    return false;
  });

  // keyboard shortcut to show all recommended places
  Mousetrap.bind(['alt+a'], function (e) {
    recClicked({
      data: recommended.all
    });
    return false;
  });

  // keyboard shortcut to show all recommended cafes
  Mousetrap.bind(['alt+c'], function (e) {
    recClicked({
      data: recommended.cafes
    });
    return false;
  });

  // keyboard shortcut to show all recommended bars
  Mousetrap.bind(['alt+b'], function (e) {
    recClicked({
      data: recommended.bars
    });
    return false;
  });

  // keyboard shortcut to show all recommended restaurants
  Mousetrap.bind(['alt+r'], function (e) {
    recClicked({
      data: recommended.restaurants
    });
    return false;
  });

  // keyboard shortcut to show all recommended clubs
  Mousetrap.bind(['alt+l'], function (e) {
    recClicked({
      data: recommended.clubs
    });
    return false;
  });

  // keyboard shortcut to clear search results
  Mousetrap.bind(['esc'], function (e) {
    clearSearchResults();
    google.maps.event.trigger(map, 'resize');
    return false;
  });

  // keyboard shortcut to load the next page of search results
  Mousetrap.bind(['space'], function (e) {
    $('#results-more').addClass('hidden');
    if (pagination && pagination.hasNextPage)
      pagination.nextPage();
  });

  $('#pac-search').keyup(function (e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 27) {
      document.getElementById('pac-search').blur();
    }
  });

  // adding jQery event listeners to DOM Objects
  // $('#pac-panel .toggle-settings').click(function () {
  //   $('#pac-panel #pac-settings').toggleClass('hidden');
  //   google.maps.event.trigger(map, 'resize');
  // });
};

//
// builds lists of the recommended places per type
//
function getRecommendations(types) {
  if (!types)
    types = ['establishment']; // each place is an establishment, so that filters all places
  if (typeof types === 'string')
    types = [types];

  var ret = [];
  var recs = Object.getOwnPropertyNames(data.recommendations);
  for (var i = 0; i < recs.length; i++) {
    var place_id = recs[i];
    var place = data.recommendations[place_id];

    if ((new RegExp('\\b' + types.join('\\b|\\b') + '\\b')).test(place.types.join(' '))) {
      //var p = {};
      //preparePlace(p);
      //koExtend(p, place, true);
      ret.push(place);
    }
  }
  return ret;
}

//
// adds a new recommendation to the saved recommendation lists
//
function recommend(rec) {

  rec.types.push('__user_recommendation__');
  data.recommendations[rec.place_id] = rec;

  recommended.all.push(rec);
  if ((new RegExp('\\b' + 'cafe' + '\\b')).test(rec.types.join(' ')))
    recommended.cafes.push(rec);
  if ((new RegExp('\\b' + 'bar' + '\\b')).test(rec.types.join(' ')))
    recommended.bars.push(rec);
  if ((new RegExp('\\b' + 'restaurant' + '\\b')).test(rec.types.join(' ')))
    recommended.restaurants.push(rec);
  if ((new RegExp('\\b' + 'night_club' + '\\b')).test(rec.types.join(' ')))
    recommended.clubs.push(rec);

  // save recommendation to cookies:
  Cookies.set(rec.place_id, rec);
  Cookies.set('placeIDs', Object.getOwnPropertyNames(data.recommendations));
}

function clearSearchResults() {

  $('#pac-search').val('');

  selectPlace(null);
  clearMarkers();
  model.searchResults.removeAll();

  // hide the pagination 'more' button before each search
  $('#results-panel').addClass('hidden');
  $('#results-more').addClass('hidden');

  pagination = null;
}

//
// called when a recommendation label is clicked
//
function recClicked(e) {
  clearSearchResults();

  var places = e.data;
  var j = model.searchResults().length,
    prevCount = j;
  // Create a marker for each result
  for (var i = 0; i < places.length; i++) {
    // not all results get added, so only increase j when successful
    if (addPlace(places[i], j, j - prevCount))
      j++;
  }

  // fit map to markers
  fitToMarkers();

  // show the results panel
  $('#results-panel').removeClass('hidden');
  google.maps.event.trigger(map, 'resize');

}

//
// called when the search box fires the 'place_changed' event
//
function placeChanged() {
  var val = $('#pac-search').val();
  clearSearchResults();
  $('#pac-search').val(val);

  // these listeners need to be here, because the DOM Elements only get inserted by knockout, when a search has been performed
  $('#results-more').click(function () {
    $('#results-more').addClass('hidden');
    if (pagination && pagination.hasNextPage)
      pagination.nextPage();
  });

  var place = autocomplete.getPlace();
  if (place.geometry) {
    setPlace(place);
  }
  else if (place.name) {
    performSearch(place.name);
  }

  // show the results panel
  $('#results-panel').removeClass('hidden');
  google.maps.event.trigger(map, 'resize');

  // take the focus away from the input box
  document.getElementById('pac-search').blur();
}

//
// called to perform the google maps search for a given text
//
function performSearch(text) {

  // get the searchoptions from the viewmodel and adjust them as needed
  var search = ko.mapping.toJS(settings.searchOptions);
  //search.bounds = map.getBounds();
  search.location = map.getCenter();
  search.radius = 5000;
  search.name = text; // TODO implement full text search with search.keyword instead of search.name (through option)
  delete search.typeOptions;

  places.nearbySearch(search, function (results, status, pgn) {

    if (status != google.maps.places.PlacesServiceStatus.OK)
      return;

    var len = results.length;
    var j = model.searchResults().length,
      prevCount = j;
    // Create a marker for each result
    for (var i = 0; i < len; i++) {
      // not all results get added, so only increase j when successful
      if (addPlace(results[i], j, j - prevCount))
        j++;
    }

    pagination = pgn;

    // pagination to load more results
    if (pagination.hasNextPage)
      $('#results-more').removeClass('hidden');

    // fit map to markers
    fitToMarkers();

  });
}

//
// sets a place as search result
//
function setPlace(place) {
  // If the place has a geometry, then present it on a map.
  if (place.geometry.viewport)
    map.fitBounds(place.geometry.viewport);
  else
    map.setCenter(place.geometry.location);

  addPlace(place, 0);
}

//
// adds a place as search result, i being the index of all results, x being the index of the current pagination page.
//
function addPlace(place, i, x) {
  if (hasType(place, 'establishment')) {

    var koPlace = ko.mapping.fromJS(place);
    koPlace.jsPlace = place; // link back to the original JS object
    koPlace.index = i;
    koPlace.indexDisplay = (i + 1) + '.';

    if (!(i >= 0))
      koPlace.indexDisplay = '';

    koPlace.first = ko.computed(function () {
      return !(this.index > 0);
    }, koPlace);

    koPlace.onClick = function () {
      selectPlace(this);
    };

    preparePlace(koPlace);
    model.searchResults.push(koPlace);

    extendPlaceDetails(koPlace);

    addMarker(koPlace, i, x);

    return true;
  }
  return false;
}

//
// selects a given place. i.e. shows the info window and highlights the search result
//
function selectPlace(koPlace) {

  if (koPlace == selectedPlace)
    return;

  if (selectedPlace) {
    closeInfoWindow();

    selectedPlace.selected(false);
    selectedPlace.marker.setAnimation(null);
    selectedPlace = null;
    model.selectedPlace(null);
  }

  if (koPlace) {
    koPlace.marker.setAnimation(google.maps.Animation.BOUNCE);

    // reset tries for detail fetching requests
    koPlace.tries = 0;
    // fetch details if not fetched yet:
    extendPlaceDetails(koPlace);

    koPlace.selected(true);
    selectedPlace = koPlace;
    model.selectedPlace(koPlace);

    infoWindow.setContent(document.getElementById('info-content'));

    // these listeners need to be here, because the DOM Elements only get inserted by knockout, when a place is selected
    $('#close-more').click(function () {
      $('.place-details').addClass('hidden');
      google.maps.event.trigger(map, 'resize');
    });

    $('#review-more').click(function () {
      $('.place-details').addClass('hidden');

      $('#place-details-content').removeClass('hidden');
      $('#close-more').removeClass('hidden');
      $('#review-details').removeClass('hidden');
      google.maps.event.trigger(map, 'resize');
    });

    $('#photos-more').click(function () {
      loadPPhotos(model.selectedPlace());
      $('.place-details').addClass('hidden');

      $('#place-details-content').removeClass('hidden');
      $('#close-more').removeClass('hidden');
      $('#photos-details').removeClass('hidden');
      google.maps.event.trigger(map, 'resize');
    });

    $('#yelp-more').click(function () {
      loadYelp(model.selectedPlace());
      $('.place-details').addClass('hidden');

      $('#place-details-content').removeClass('hidden');
      $('#close-more').removeClass('hidden');
      $('#yelp-details').removeClass('hidden');
      google.maps.event.trigger(map, 'resize');
    });

    infoWindow.open(map, koPlace.marker);
  }
}

function preparePlace(koPlace) {
  // create all necessary observables for knockout binding but don't overwrite them
  koExtend(koPlace, {
    selected: ko.observable(false),
    name: ko.observable(),
    markerIcon: ko.observable(),
    vicinity: ko.observable(),
    website: ko.observable(),
    websiteText: ko.observable(),
    formatted_phone_number: ko.observable(),
    rating: ko.observable(),
    url: ko.observable(),
    review: ko.observable({
      recommended: ko.observable(),
      description: ko.observable(),
      tags: ko.observableArray(),
      price: ko.observable(),
      value4money: ko.observable(),
      atmosphere: ko.observable(),
      friendlyness: ko.observable(),
      speed: ko.observable(),
      visited: ko.observable()
    }),
    photos: ko.observableArray(),
    pPhotos: ko.observable({
      data: ko.observableArray(),
      requested: ko.observable(),
      loaded: ko.observable(),
      message: ko.observable()
    }),
    yelp: ko.observable({
      data: ko.observable(),
      requested: ko.observable(),
      loaded: ko.observable(),
      message: ko.observable()
    })
  }, false);

  koPlace.hasReview = ko.computed(function () {
    return (this.review && this.review().recommended());
  }, koPlace);

  koPlace.hasPhotos = ko.computed(function () {
    return (this.photos().length > 0 || this.pPhotos().data().length > 0);
  }, koPlace);

  koPlace.hasYelp = ko.computed(function () {
    return true;
  }, koPlace);

  koPlace.getStarWidth = ko.computed(function () {
    if (this.rating && this.rating() > 0)
      return (65 * this.rating() / 5) + 'px';
    return '57.2px';
  }, koPlace);

  koPlace.markRecommended = function () {
    this.review().recommended(true);
    recommend(this.getDataToSave());

    // change the marker icon to green
    var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (this.index % 26));
    var markerIcon = MARKER_PATH_GREEN + markerLetter + '.png';

    koPlace.markerIcon(markerIcon);
    koPlace.marker.setIcon(markerIcon);
  };

  koPlace.getDataToSave = function () {
    return {
      place_id: this.place_id(),
      name: this.name(),
      vicinity: this.vicinity(),
      website: this.website(),
      formatted_phone_number: this.formatted_phone_number(),
      geometry: {
        location: ko.mapping.toJS(this.geometry().location)
      },
      types: this.types(),
      review: ko.mapping.toJS(this.review)
    };
  };

  updateBindings(koPlace);
}

function updateBindings(koPlace) {
  // build a short url for display of the website.
  var website = koPlace.website();
  if (website) {
    var matches = website.replace(/^https?:\/\//i, '').replace(/^www\./i, '').match(/.+?\//);
    if (matches && matches[0]) {
      koPlace.websiteText(matches[0].replace(/\/$/, ''));
    }
    // this is necessary because the $.extend function doesn't get noticed by knockout.
    //koPlace.website.valueHasMutated();
  }

  // prepare google photos array:
  for (var p = 0; p < koPlace.photos().length; p++) {
    var photo = koPlace.photos()[p];
    photo.photo_file_url = ko.observable(photo.getUrl({
      'maxWidth': 200,
      'maxHeight': 100
    }));
    photo.photo_url = ko.observable();
    photo.owner_name = ko.observable();
    var attrib = photo.html_attributions();
    if (attrib && attrib.length > 0) {
      photo.photo_url(attrib[0].match(/".+?"/)[0].replace(/"/g, ''));
      photo.owner_name(attrib[0].match(/>.+?</)[0].replace(/>|</g, ''));
    }
  }
}

// adds additional information from the google places api AFTER the knockout data binding to a knockout observable
// this needs to be done after the place is added to the model, because the api call happens asynchronously
function extendPlaceDetails(koPlace) {

  // check a flag to minimize api calls
  if (!koPlace.extended || !koPlace.extended()) {

    if (!koPlace.tries)
      koPlace.tries = 0;
    // fetch further details from Google Places (like website, phone number, etc)
    places.getDetails({
        placeId: koPlace.place_id()
      },
      function (placeDetails, status) {
        koPlace.tries++;
        if (status == google.maps.places.PlacesServiceStatus.OK) {

          // if the place is also recommended, load the corresponding recommendation into the place object
          var place_id = koPlace.place_id();
          if (data.recommendations[place_id]) {
            koExtend(koPlace, data.recommendations[place_id], true);
          }

          var koDetails = ko.mapping.fromJS(placeDetails);
          preparePlace(koDetails);
          koExtend(koPlace, koDetails, true);
          $.extend(koPlace.jsPlace, placeDetails);

          // set a flag to minimize api calls
          koPlace.extended = ko.observable(true);
        }
        else {
          // if the query limit is exceeded, wait 1 second, try 5 times
          if (koPlace.tries < 5)
            setTimeout(extendPlaceDetails(koPlace), 1000);
        }
      });
  }
}

//
// extend function which merges two knockout objects
//
function koExtend(koBase, koExtension, overwrite) {

  if (!koBase || !koExtension)
    return;

  // unwrap extension if necessary
  if (koExtension.name == 'observable')
    koExtension = koExtension();

  // if the extension value is of a simple type, simply set the value
  if (typeof koExtension !== 'object') {
    if (overwrite) {
      if (koBase.name == 'observable')
        koBase(koExtension);
      else
        koBase = ko.observable(koExtension);
    }
  }
  else {

    // create an empty observable object which will be extended
    if (koBase.name == 'observable' && typeof koBase() === 'undefined') {
      koBase({});
    }

    var baseIsObservable = false;

    // unwrap base object
    if (koBase.name == 'observable') {
      koBase = koBase();
      baseIsObservable = true;
    }

    // iterate through properties
    var props = Object.getOwnPropertyNames(koExtension);
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var exValue = koExtension[prop];
      var exIsObservable = false;

      // unwrap value
      if (exValue && exValue.name === 'observable') {
        exValue = exValue();
        exIsObservable = true;
      }

      // clone functions if they don't exist yet:
      if (typeof koExtension[prop] === 'function' && !exIsObservable) {
        if (!koBase[prop])
          koBase[prop] = koExtension[prop].bind(koBase);
        continue;
      }

      // create new observable if its not existing yet, no recursion is needed here since there can't be subscribers
      if (!koBase[prop] || koBase[prop].name !== 'observable') {

        // if the property already exists but is not an observable and shouldn't be overwriten, simply wrap the property
        if (koBase[prop] && !baseIsObservable && !overwrite) {
          koBase[prop] = ko.observable(koBase[prop]);
          koExtend(koBase[prop], exValue, overwrite);
          continue;
        }
        // create the observable:
        if (Array.isArray(exValue))
          koBase[prop] = ko.observableArray();
        else
          koBase[prop] = ko.observable();

        if (exValue) {
          // set the value:
          if (exIsObservable)
            koBase[prop](exValue);
          else
            koBase[prop](ko.mapping.fromJS(exValue));
        }
      }
      // if the observable exists already:
      else {
        if (overwrite) {
          // arrays simply get overwritten
          if (Array.isArray(exValue)) {
            // if the base property is not an observable array, a new one has to be crated
            if (!Array.isArray(koBase[prop]()))
              koBase[prop] = ko.observableArray(exValue);
            else
              koBase[prop](exValue);
          }
          // recursively extend the property:
          else {
            koExtend(koBase[prop], exValue, overwrite);
          }
        }
      }
    }
  }
}

var MARKER_PATH_GREEN = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker';

//
// adds a marker to the map for a given place, i being the index of all results, x being the index of the current pagination page.
//
function addMarker(koPlace, i, x) {

  // use letter-coded icons
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  if (koPlace.hasReview())
    markerIcon = MARKER_PATH_GREEN + markerLetter + '.png';

  // create a marker
  var m = new google.maps.Marker({
    title: koPlace.name(),
    position: new google.maps.LatLng(koPlace.jsPlace.geometry.location.G, koPlace.jsPlace.geometry.location.K),
    animation: google.maps.Animation.DROP,
    icon: markerIcon
  });
  m.koPlace = koPlace;
  koPlace.marker = m;
  markers[i] = m;

  koPlace.markerIcon(markerIcon);

  google.maps.event.addListener(m, 'click', markerClicked);

  if (!x)
    x = i;
  setTimeout(dropMarker(i), x * 50);
}

//
// clears all markers
//
function clearMarkers() {
  for (var i = 0, len = markers.length; i < len; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

//
// callback to drop the marker on the map after a timeout
//
function dropMarker(i) {
  return function () {
    if (!i)
      i = 0;
    markers[i].setMap(map);
  };
}

//
// called when a marker is clicked
//
function markerClicked() {
  selectPlace(this.koPlace);
}

//
// helper function to check if a place has a certain type
//
function hasType(place, type) {
  for (var i = 0, len = place.types.length; i < len; i++) {
    if (place.types[i] == type)
      return true;
  }
}

//
// fits the map to all markers
//
function fitToMarkers() {
  var bounds = new google.maps.LatLngBounds();
  var i = 0,
    len = markers.length;
  for (i = 0; i < len; i++) {
    var marker = markers[i];

    bounds.extend(marker.getPosition());
    var koPlace = marker.koPlace;
    if (koPlace && koPlace.jsPlace.geometry.viewport)
      bounds.extend(koPlace.jsPlace.geometry.viewport);
  }
  if (i > 0)
    map.fitBounds(bounds);

  // don't zoom too close when few markers are present
  if (map.getZoom() > 17)
    map.setZoom(17);
}

//
// called, when the map is clicked, closes the info window.
//
function mapClicked(e) {
  selectPlace(null);
}

//
// called, when the info window is closed. little hack to store the content of the info window back in the DOM, otherwise the knockout binding will stop working.
//
function infoWindowClosed() {
  selectPlace(null);
}

function closeInfoWindow() {
  infoWindow.close();

  // this was a tricky one. see here why: http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
  var content = infoWindow.getContent();
  if (content)
    document.getElementById('info-window-container').appendChild(content);
}

var PHOTOS_URL = 'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&size=medium&mapfilter=true';
var PHOTOS_MAX_COUNT = 6;

function loadPPhotos(koPlace, callback) {

  // prevent double clicks:
  if (koPlace && !koPlace.pPhotos().requested()) {
    koPlace.pPhotos().requested(true);
    koPlace.pPhotos().message('loading Panoramio data');

    var position = ko.mapping.toJS(koPlace.geometry().location);

    var ll = '&minx=' + (position.lng() - 0.0002) + '&miny=' + (position.lat() - 0.0002) + '&maxx=' + (position.lng() + 0.0002) + '&maxy=' + (position.lat() + 0.0002);
    var url = PHOTOS_URL + ll;

    try {
      // place the request
      $.ajax({
        url: url,
        dataType: 'jsonp',
        // in case of success add the images into the placeholder
        success: function (data) {
          var photos = koPlace.pPhotos();

          if (data.photos.length > 0) {
            for (var i = 0; i < data.photos.length && i < PHOTOS_MAX_COUNT; i++)
              photos.data().push(data.photos[i]);
          }
          photos.message(null);
          photos.loaded(true);
          koPlace.pPhotos.valueHasMutated();

          if (photos.data().length == 0)
            photos.message('no pictures found');

          if (callback)
            callback();
        },
        // ajax error handling
        error: function () {
          koPlace.pPhotos().requested(false);
          koPlace.pPhotos().message('ups, something went wrong! please retry');

          if (callback)
            callback();
        }
      });

    }
    catch (e) {
      koPlace.pPhotos().requested(false);
      koPlace.pPhotos().message('ups, something went wrong! please retry');
    }
  }
}

var YWSID = 'qw6jC11x1OciJ92VVnRwEg';

function loadYelp(koPlace, callback) {

  // prevent double clicks:
  if (koPlace && !koPlace.yelp().requested()) {
    koPlace.yelp().requested(true);
    koPlace.yelp().message('loading yelp data');

    var mapCenter = map.getCenter();
    var URL = 'http://api.yelp.com/' +
      'business_review_search?' +
      'callback=' + 'handleYelpResults' +
      '&term=' + koPlace.name() +
      '&num_biz_requested=10' +
      '&lat=' + mapCenter.lat() +
      '&long=' + mapCenter.lng() +
      '&radius=' + 5 +
      '&ywsid=' + YWSID;
    var yelpRequestURL = encodeURI(URL);

    /* do the api request */
    var script = document.createElement('script');
    script.src = yelpRequestURL;
    script.type = 'text/javascript';
    var head = document.getElementsByTagName('head').item(0);
    head.appendChild(script);

  }
}

/*
 * If a sucessful API response is received, place
 * markers on the map.  If not, display an error.
 */
window.handleYelpResults = function (data) {
  if (model.selectedPlace && model.selectedPlace()) {
    var koPlace = model.selectedPlace();
    var yelp = koPlace.yelp();

    if (data.message.text == 'OK') {
      if (data.businesses.length == 0) {
        yelp.message('No yelp business found');
        return;
      }
      yelp.data(ko.mapping.fromJS(data.businesses[0]));
      yelp.message(null);
      yelp.loaded(true);
    }
    else {
      yelp.message('Error: ' + data.message.text);
      yelp.requested(false);
    }
  }
}

module.exports = new ViewModel();
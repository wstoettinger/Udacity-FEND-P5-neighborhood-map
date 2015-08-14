'use strict';

// load necessary files using browserify
var settings = require('./settings.js');
var data = require('./data.js');
var ko = require('knockout');
ko.mapping = require('knockout.mapping');

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

  //
  // Recommended Places
  //
  recommended.all = getRecommendations();
  recommended.cafes = getRecommendations('cafe');
  recommended.bars = getRecommendations('bar');
  recommended.restaurants = getRecommendations('restaurant');
  recommended.clubs = getRecommendations('club');
};

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
    name: "Styled Map"
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

  $("#results-more").click(function () {
    $("#results-more").addClass("hidden");
    if (pagination && pagination.hasNextPage)
      pagination.nextPage();
  });

  // adding jQery event listeners to DOM Objects
  // $("#pac-panel .toggle-settings").click(function () {
  //   $("#pac-panel #pac-settings").toggleClass("hidden");
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
      ret.push(place);
    }
  }
  return ret;
}

function clearSearchResults() {
  infoWindowClosed();
  clearMarkers();
  model.searchResults.removeAll();

  // hide the pagination "more" button before each search
  $("#results-panel").addClass("hidden");
  $("#results-more").addClass("hidden");

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
  $("#results-panel").removeClass("hidden");
  google.maps.event.trigger(map, "resize");

}

//
// called when the search box fires the 'place_changed' event
//
function placeChanged() {
  clearSearchResults();

  var place = autocomplete.getPlace();
  if (place.geometry) {
    setPlace(place);
  }
  else if (place.name) {
    performSearch(place.name);
  }

  // show the results panel
  $("#results-panel").removeClass("hidden");
  google.maps.event.trigger(map, "resize");
};

//
// called to perform the google maps search for a given text
//
function performSearch(text) {

  // get the searchoptions from the viewmodel and adjust them as needed
  var search = ko.mapping.toJS(settings.searchOptions);
  search.bounds = map.getBounds();
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
      $("#results-more").removeClass("hidden");

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
    }

    extendPlaceDetails(koPlace);
    model.searchResults.push(koPlace);

    if (i >= 0)
      addMarker(koPlace, i, x);
    else
      setMarker(koPlace);

    return true;
  }
  return false;
}

//
// selects a given place. i.e. shows the info window and highlights the search result
//
function selectPlace(koPlace) {
  if (selectedPlace)
    selectedPlace.selected(false);

  if (koPlace) {
    koPlace.selected(true);
    selectedPlace = koPlace;
    model.selectedPlace(koPlace);

    infoWindow.setContent(document.getElementById('info-content'));

    $('#close-more').click(function () {
      $('#close-more').addClass("hidden");
      $("#place-details-content").addClass("hidden");
      $("#review-details").addClass("hidden");
      google.maps.event.trigger(map, 'resize');
    });

    $('#review-more').click(function () {
      $("#place-details-content").removeClass("hidden");
      $('#close-more').removeClass("hidden");
      $("#review-details").removeClass("hidden");
      google.maps.event.trigger(map, 'resize');
    });

    if (koPlace.marker)
      infoWindow.open(map, koPlace.marker);
  }
  else {
    infoWindow.close();
    infoWindowClosed();
    //model.selectedPlace(null);
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
      description: ko.observable(),
      tags: ko.observableArray(),
      price: ko.observable(),
      value4money: ko.observable(),
      atmosphere: ko.observable(),
      friendlyness: ko.observable(),
      speed: ko.observable(),
      visited: ko.observable()
    })
  }, false);

  koPlace.hasReview = ko.computed(function () {
    return (this.review().description() || this.review().tags().length > 0 || this.review().price());
  }, koPlace);

  koPlace.getStarWidth = ko.computed(function () {
    if (this.rating && this.rating() > 0)
      return (65 * this.rating() / 5) + 'px';
    return '57.2px';
  }, koPlace);
}

// adds additional information from the google places api AFTER the knockout data binding to a knockout observable
// this needs to be done after the place is added to the model, because the api call happens asynchronously
function extendPlaceDetails(koPlace) {

  preparePlace(koPlace);

  // check a flag to minimize api calls
  if (!koPlace.extended || !koPlace.extended()) {

    // if the place is also recommended, load the corresponding recommendation into the place object
    var place_id = koPlace.place_id();
    if (data.recommendations[place_id]) {
      koExtend(koPlace, data.recommendations[place_id], true);
    }

    // fetch further details from Google Places (like website, phone number, etc)
    places.getDetails({
        placeId: place_id
      },
      function (placeDetails, status) {

        if (status == google.maps.places.PlacesServiceStatus.OK) {

          var koDetails = ko.mapping.fromJS(placeDetails);
          koExtend(koPlace, koDetails, true);
          $.extend(koPlace.jsPlace, placeDetails);

          // set a flag to minimize api calls
          koPlace.extended = ko.observable(true);

          // build a short url for display of the website.
          var website = koPlace.website();
          if (website) {
            var matches = website.replace(/^https?:\/\//i, '').replace(/^www\./i, '').match(/.+?\//);
            if (matches && matches[0]) {
              koPlace.websiteText(matches[0].replace(/\/$/, ''));
            }
          }

          // this is necessary because the $.extend function doesn't get noticed by knockout.
          koPlace.website.valueHasMutated();
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

    // unwrap base object
    if (koBase.name == 'observable')
      koBase = koBase();

    // iterate through properties
    var props = Object.getOwnPropertyNames(koExtension);
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var exValue = koExtension[prop];
      var isObservable = false;

      // unwrap value
      if (exValue.name === 'observable') {
        exValue = exValue();
        isObservable = true;
      }

      // clone functions if they don't exist yet:
      if (typeof koExtension[prop] === 'function' && !isObservable) {
        if (!koBase[prop])
          koBase[prop] = koExtension[prop].bind(koBase);
        continue;
      }

      // create new observable if its not existing yet, no recursion is needed here since there can't be subscribers
      if (!koBase[prop] || koBase[prop].name !== 'observable') {

        // if the property already exists but is not an observable and shouldn't be overwriten, simply wrap the property
        if (koBase[prop] && koBase[prop].name !== 'observable' && !overwrite) {
          koBase[prop] = ko.observable(koBase[prop]);
          continue;
        }
        // create the observable:
        if (Array.isArray(exValue))
          koBase[prop] = ko.observableArray();
        else
          koBase[prop] = ko.observable();

        if (exValue) {
          // set the value:
          if (isObservable)
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

//
// adds the place to the model and sets the marker
//
function setMarker(koPlace) {

  if (koPlace) {
    // koPlace.markerIcon = ko.observable(); // TODO: set the porper icon here

    marker.koPlace = koPlace;
    koPlace.marker = marker;
    marker.setTitle(koPlace.name());
    marker.setPosition(koPlace.jsPlace.geometry.location);
    marker.setVisible(true);

    markers[0] = marker;
  }
  else {
    selectPlace(null);
    marker.setVisible(false);
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
  setMarker(null);
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
  infoWindow.close();
  infoWindowClosed();
};

//
// called, when the info window is closed. little hack to store the content of the info window back in the DOM, otherwise the knockout binding will stop working.
//
function infoWindowClosed() {

  if (selectedPlace)
    selectedPlace.selected(false);

  // this was a tricky one. see here why: http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
  var content = infoWindow.getContent();
  if (content)
    document.getElementById('info-window-container').appendChild(content);

}

module.exports = new ViewModel();
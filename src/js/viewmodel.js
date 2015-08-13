'use strict';

var settings = require('./settings.js');
var data = require('./data.js');
//var $ = require('jquery');
var ko = require('knockout');
ko.mapping = require('knockout.mapping');

var model, map, geocoder, places, autocomplete, infoWindow, marker, markers = [],
  selectedPlace;

function ViewModel() {
  model = this;

  //
  // Contact Info
  //
  model.contactInfo = ko.observable(settings.ContactInfo);

  // extending the contact info with a computed observable for the full name
  model.contactInfo().fullName = ko.computed(function () {
    return this.first_name + " " + this.last_name;
  }, model.contactInfo());

  //
  // Search
  //
  model.searchInput = ko.observable();
  model.searchOptions = ko.mapping.fromJS(settings.searchOptions);

  // extender which recalculates the types array each time a checkbox changes.
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
  model.searchResults = ko.observableArray(); // ko.mapping.fromJS(data.searchResults);
  model.selectedPlace = ko.observable();

  model.resultsCount = ko.computed(function () {
    return this.searchResults().length;
  }, model);

  //
  // Saved Locations
  // TODO
};

ViewModel.prototype.initialize = function () {

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
  google.maps.event.addListener(map, 'bounds_changed', mapBoundsChanged);
  google.maps.event.addListener(map, 'click', mapClicked);
  google.maps.event.addListener(marker, 'click', markerClicked);
  google.maps.event.addListener(infoWindow, 'closeclick', closeInfoWindow);

  $('#rec-all').click([], recClicked);
  $('#rec-cafes').click(['cafe'], recClicked);
  $('#rec-bars').click(['bar'], recClicked);
  $('#rec-restaurants').click(['restaurant'], recClicked);
  $('#rec-clubs').click(['night_club'], recClicked);

  // adding jQery event listeners to DOM Objects
  // $("#pac-panel .toggle-settings").click(function () {
  //   $("#pac-panel #pac-settings").toggleClass("hidden");
  //   google.maps.event.trigger(map, 'resize');
  // });
};

function recClicked(e) {
  var types = e.data;

  var recs = Object.getOwnPropertyNames(data.recommendations);
  for (var i = 0; i < recs.length; i++) {
    var rec = data.recommendations[recs[i]];

    if ((new RegExp('\\b' + types.join('\\b|\\b') + '\\b')).test(rec.types.join('\\b|\\b'))) {
      alert('match');
    }
  }
}

//
// called when the search box fires the 'place_changed' event
//
function placeChanged() {
  clearMarkers();
  model.searchResults.removeAll();

  // hide the pagination "more" button before each search
  $("#results-panel").addClass("hidden");
  $("#results-more").addClass("hidden");

  var place = autocomplete.getPlace();
  if (place.geometry) {
    setPlace(place);
  }
  else if (place.name) {
    performSearch(place.name);
  }
  // show the results panel
  $("#results-panel").removeClass("hidden");
};

function performSearch(text) {

  // get the searchoptions from the viewmodel and adjust them as needed
  var search = ko.mapping.toJS(settings.searchOptions);
  search.bounds = map.getBounds();
  search.name = text;
  delete search.typeOptions;

  // TODO implement full text search with search.keyword (if search setting selected)

  places.nearbySearch(search, function (results, status, pagination) {

    if (status != google.maps.places.PlacesServiceStatus.OK)
      return;

    var len = results.length;
    var j = model.searchResults().length;
    // Create a marker for each result
    for (var i = 0; i < len; i++) {
      // not all results get added, so only increase j when successful
      if (addPlace(results[i], j))
        j++;
    }

    // pagination to load more results
    if (pagination.hasNextPage) {
      var moreButton = $("#results-more");
      moreButton.removeClass("hidden");

      moreButton.click(function () {
        moreButton.addClass("hidden");
        pagination.nextPage();
      });
    }

    // fit map to markers
    fitToMarkers();

  });
}

function setPlace(place) {
  // If the place has a geometry, then present it on a map.
  if (place.geometry.viewport)
    map.fitBounds(place.geometry.viewport);
  else
    map.setCenter(place.geometry.location);

  addPlace(place);
}

function addPlace(place, i) {
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
      addMarker(koPlace, i);
    else
      setMarker(koPlace);

    return true;
  }
  return false;
}

function selectPlace(koPlace) {
  if (selectedPlace)
    selectedPlace.selected(false);

  if (koPlace) {
    koPlace.selected(true);
    selectedPlace = koPlace;
    model.selectedPlace(koPlace);

    infoWindow.setContent(document.getElementById('info-content'));

    if (koPlace.marker)
      infoWindow.open(map, koPlace.marker);
  }
  else {
    infoWindow.close();
    //model.selectedPlace(null);
  }
}

// adds additional information from the google places api AFTER the knockout data binding to a knockout observable
// this needs to be done after the place is added to the model, because the api call happens asynchronously
function extendPlaceDetails(koPlace) {

  if (!koPlace.extended || !koPlace.extended()) {

    // create all necessary observables but don't overwrite them
    koExtend(koPlace, {
      selected: ko.observable(false),
      formatted_phone_number: ko.observable(),
      rating: ko.observable(),
      url: ko.observable(),
      website: ko.observable(),
      websiteText: ko.observable(),
      markerIcon: ko.observable()
    }, false);

    koPlace.getStarWidth = ko.computed(function () {
      if (this.rating && this.rating() > 0)
        return (65 * this.rating() / 5) + 'px';
      return '57.2px';
    }, koPlace);

    var place_id = koPlace.place_id();
    if (data.recommendations[place_id])
      koPlace.rec = ko.mapping.fromJS(data.recommendations[place_id]);

    places.getDetails({
        placeId: place_id
      },
      function (placeDetails, status) {

        if (status == google.maps.places.PlacesServiceStatus.OK) {

          var koDetails = ko.mapping.fromJS(placeDetails);
          koExtend(koPlace, koDetails, true);
          $.extend(koPlace.jsPlace, placeDetails);
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
        koBase = koExtension;
    }
  }
  else {
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
          else
            koExtend(koBase[prop], exValue, overwrite);
        }
      }
    }
  }
}

// adds the place to the model and sets the marker
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

function addMarker(koPlace, i) {

  // use letter-coded icons
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  if (koPlace.rec)
    markerIcon = MARKER_PATH_GREEN + markerLetter + '.png';

  // create a marker
  var m = new google.maps.Marker({
    title: koPlace.name(),
    position: koPlace.jsPlace.geometry.location,
    animation: google.maps.Animation.DROP,
    icon: markerIcon
  });
  m.koPlace = koPlace;
  koPlace.marker = m;
  markers[i] = m;

  koPlace.markerIcon(markerIcon);

  google.maps.event.addListener(m, 'click', markerClicked);
  setTimeout(dropMarker(i), i * 50);
}

function clearMarkers() {
  setMarker(null);
  for (var i = 0, len = markers.length; i < len; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function dropMarker(i) {
  return function () {
    if (!i)
      i = 0;
    markers[i].setMap(map);
  };
}

function markerClicked() {
  selectPlace(this.koPlace);
}

function hasType(place, type) {
  for (var i = 0, len = place.types.length; i < len; i++) {
    if (place.types[i] == type)
      return true;
  }
}

function geocode(place) {
  geocoder.geocode({
    'placeId': place.place_id
  }, makeGeocodeCallback(place, function (place, results, status) {

    if (status == google.maps.GeocoderStatus.OK && results[0]) {
      // in case the place is found by the geocoder, push all parameters of the result to the place
      var result = results[0];
      delete result.geometry.location; // keep the original location
      delete result.geometry.location_type; // drop location type
      delete result.types; // keep the original types
      delete result.place_id; // should be equal to place.place_id, but just to make sure, no overwrite happens

      $.extend(place, result);
    }

    if (!place.rating)
      place.rating = null;

    // add the place to the model anyways
    var mapping = ko.mapping.fromJS(place);
    model.searchResults.push(mapping);
  }));
}

function makeGeocodeCallback(place, callback) {
  return function (results, status) {
    if (callback)
      callback(place, results, status);
  };
}

function fitToMarkers() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, len = markers.length; i < len; i++) {
    var marker = markers[i];

    bounds.extend(marker.getPosition());
    var koPlace = marker.koPlace;
    if (koPlace && koPlace.jsPlace.geometry.viewport)
      bounds.extend(koPlace.jsPlace.geometry.viewport);
  }

  map.fitBounds(bounds);

  // don't zoom too close when few markers are present
  if (map.getZoom() > 17)
    map.setZoom(17);
}

function mapBoundsChanged() {
  var bounds = map.getBounds();

};

function mapClicked(e) {
  //selectPlace(null);
};

function closeInfoWindow() {
  // this was a tricky one. see here why: http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
  document.getElementById('info-window-container').appendChild(infoWindow.getContent());
}

module.exports = new ViewModel();
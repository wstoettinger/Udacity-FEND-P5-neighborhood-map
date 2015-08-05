'use strict';

var settings = require('./settings.js');
var data = require('./data.js');
//var $ = require('jquery');
var ko = require('knockout');
ko.mapping = require('knockout.mapping');

var model, map, geocoder, places, autocomplete, infoWindow, marker, markers = [];

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
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('pac-panel'));
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
  infoWindow.setContent(document.getElementById('info-content'));

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

  // adding jQery event listeners to DOM Objects
  $("#pac-panel .toggle-settings").click(function () {
    $("#pac-panel #pac-settings").toggleClass("hidden");
    google.maps.event.trigger(map, 'resize');
  });
};

//
// called when the search box fires the 'place_changed' event
//
function placeChanged() {
  clearResults();
  clearMarkers();

  var place = autocomplete.getPlace();
  if (place.geometry) {

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport)
      map.fitBounds(place.geometry.viewport);
    else
      map.setCenter(place.geometry.location);

    if (hasType(place, "establishment"))
      setMarker(place);
  }
  else if (place.name) {
    performSearch(place.name);
  }
};

function performSearch(text) {
  // clear results
  clearResults();
  clearMarkers();

  // get the searchoptions from the viewmodel and adjust them as needed
  var search = ko.mapping.toJS(settings.searchOptions);
  search.bounds = map.getBounds();
  search.name = text;
  delete search.typeOptions;

  // TODO implement full text search with search.keyword (if search setting selected)

  places.nearbySearch(search, function (results, status) {

    if (status != google.maps.places.PlacesServiceStatus.OK)
      return;

    var len = results.length;

    if (len == 1) { // set the single marker
      if (hasType(place, "establishment"))
        setMarker(results[0]);
    }
    else { // Create a marker for each result
      for (var i = 0, j = 0; i < len; i++) {
        var place = results[i];
        if (hasType(place, "establishment")) {
          addMarker(place, j);
          j++;
        }
      }
    }

  });
}

function clearResults() {
  model.searchResults.removeAll();
}

// adds the place to the model and sets the marker
function setMarker(place) {

  if (place) {

    if (!place.rating)
      place.rating = null;
    place.markerIcon = null; // TODO: set the porper icon here
    model.searchResults.push(ko.mapping.fromJS(place));

    marker.placeResult = place;
    marker.setTitle(place.name);
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    //showInfoWindow(marker);
  }
  else {
    showInfoWindow(null);
    marker.setVisible(false);
  }
}

//var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker';

function addMarker(place, i) {

  // use letter-coded icons
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  // create a marker
  var m = new google.maps.Marker({
    title: place.name,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP,
    icon: markerIcon
  });
  m.placeResult = place;
  markers[i] = m;

  if (!place.rating)
    place.rating = null;
  place.markerIcon = markerIcon;
  // add the result to the model
  model.searchResults.push(ko.mapping.fromJS(place));

  google.maps.event.addListener(m, 'click', markerClicked);
  setTimeout(dropMarker(i), i * 100);
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
  var marker = this;
  showInfoWindow(marker);
}

function showInfoWindow(marker) {
  if (marker) {
    places.getDetails({
        placeId: marker.placeResult.place_id
      },
      function (place, status) {
        var p = marker.placeResult;
        if (status == google.maps.places.PlacesServiceStatus.OK)
          p = place;

        model.selectedPlace(ko.mapping.fromJS(p));
        infoWindow.open(map, marker);
      });
  }
  else {
    model.selectedPlace(null);
    infoWindow.close();
  }
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

function mapBoundsChanged() {
  var bounds = map.getBounds();

};

function mapClicked(e) {
  infoWindow.close();
};

module.exports = new ViewModel();
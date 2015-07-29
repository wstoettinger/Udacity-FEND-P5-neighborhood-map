/*
 * this app displays a neighborhood map with basic search functionality, implementin the Google Maps API and other third party APIs for further information.
 */

var geocoder;
var map;
var mapInfo;
var tempMarker = {};

// the basic ViewModel
var ViewModel = function () {
  var self = this;

  // the contact info can be found in /models/data.js
  self.contactInfo = ko.observable(ContactInfo);

  // extending the contact info with a computed observable for the full name
  self.contactInfo().fullName = ko.computed(function () {
    return this.first_name + " " + this.last_name;
  }, self.contactInfo());

  // prepare all data entries for display in search results
  for (var i = 0; i < mapData.length; i++) {
    var entry = mapData[i];

    entry.parent = self;
    entry.images = ko.observableArray();
    entry.imagesLoaded = false;
    entry.showLoading = ko.observable(true);
    entry.isExpanded = ko.observable(false);
    entry.errorText = ko.observable();
  }

  tempMarker.parent = self;
  tempMarker.images = ko.observableArray();
  tempMarker.imagesLoaded = false;
  tempMarker.showLoading = ko.observable(true);
  tempMarker.isExpanded = ko.observable(false);
  tempMarker.errorText = ko.observable();

  // 
  // search properties
  //
  // the search string
  self.searchString = ko.observable();
  // an observable array for the search results
  self.searchResults = ko.observableArray();
  // observable to display info messages to the user
  self.info = ko.observable();

  // the actual search function
  self.searchReferences = function () {

    var search = self.searchString();

    if (!search)
      search = "";

    if (tempMarker)
      tempMarker.marker.setMap(null);

    // telling the user what we are doing
    self.info("results for: " + search + "(see list below map)");
    mapInfo.close();

    search = search.toLowerCase();

    // first remove all previous results
    self.searchResults.removeAll();

    // then loop through all the reference data and search for the search string in the title of the data.
    for (var i = 0; i < mapData.length; i++) {
      var ref = mapData[i];

      if (ref.title && ref.title.toLowerCase().includes(search) || ref.address && ref.address.toLowerCase().includes(search)) {
        // if the title includes the search string, push a new object to the search results.
        // TODO: implement wildcard search or regex matching
        self.searchResults.push(ref);

      }

      // update the markers on the map
      self.updateMarkers();
    }
  }

  self.expandResult = function () {
    this.isExpanded(!this.isExpanded());
    if (this.isExpanded() && !this.imagesLoaded) {
      asyncLoadImages(this, 5);
    }
  }

  // a function to display all results
  self.showAll = function () {
    // telling the user what we are doing
    self.info("showing all");
    mapInfo.close();

    // first remove all previous results
    self.searchResults.removeAll();

    // then loop through all the reference data and add each entry to the search results
    for (var i = 0; i < mapData.length; i++) {
      var ref = mapData[i];

      // this is just a safety check to see if the title was set:
      if (ref.title) {
        self.searchResults.push(ref);
      }

      // update the markers on the map
      self.updateMarkers();
    }
  }

  // updates the markers shown on the map
  self.updateMarkers = function () {
    // hide all the existing markers
    for (var i = 0; i < mapData.length; i++) {
      var entry = mapData[i];
      if (entry.marker)
        entry.marker.setMap(null);
    }

    var searchRes = self.searchResults();
    for (var i = 0; i < searchRes.length; i++) {
      var result = searchRes[i];

      if (result.marker)
        result.marker.setMap(map);
    }

    fitMapToMarkers();
  }
}

ko.applyBindings(new ViewModel());

// called to initialize the map
function initMap() {
  // instantiate the geocoder
  geocoder = new google.maps.Geocoder();

  settings.mapOptions.mapTypeControlOptions = {
    mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
  };

  // create the actual map object
  map = new google.maps.Map(document.getElementById('map-canvas'),
    settings.mapOptions);

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('map_style', new google.maps.StyledMapType(settings.mapStyle, {
    name: "Styled Map"
  }));
  map.setMapTypeId('map_style');

  // create an InfoWindow which will be displayed when the user clicks on a marker
  mapInfo = new google.maps.InfoWindow();

  // create markers for all data entries
  for (var i = 0; i < mapData.length; i++) {
    var entry = mapData[i];

    // run the geocoder with the callback
    geocoder.geocode({
      address: entry.address,
      region: entry.region
    }, makeGeocodeCallback(entry, function (entry) {
      fitMapToMarkers();
    }));
  }

  google.maps.event.addListener(map, 'click', function (e) {
    placeMarker(e.latLng, map);
  });

  // google.maps.event.addListener(map, 'zoom_changed', function () {
  //   var zoomLevel = map.getZoom();
  //   infowindow.setContent('Zoom: ' + zoomLevel);
  // });
}

// create a callback function for the geocoder which takes the marker object
function makeGeocodeCallback(entry, successCallback) {
  return function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      // create a marker for the queried geocode
      entry.marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map: map
      });

      //style the markers depending on the data set
      if (entry.type && settings.markerIcons[entry.type]) {
        entry.marker.setIcon(settings.markerIcons[entry.type]);
      }

      entry.position = results[0].geometry.location;

      if (results[1]) {
        entry.formatted_address = results[1].formatted_address;
        if (!entry.address)
          entry.address = entry.formatted_address;

        if (!entry.title)
          entry.title = entry.formatted_address;
      }

      // add a click listener to the marker and show an InfoWindow with the title when the marker is clicked.
      google.maps.event.addListener(entry.marker, 'click', function () {
        mapInfo.setContent("<strong>" + entry.title + "</strong><br/><div id=\"infoWindowImage\" >loading Image</div>");
        mapInfo.open(entry.marker.get('map'), entry.marker);
        if (!entry.imagesLoaded)
          asyncLoadImages(entry, 5, function () {
            buildImageHtml($("#infoWindowImage"), entry);
          });
        else
          buildImageHtml($("#infoWindowImage"), entry);
      });

      if (successCallback)
        successCallback(entry);
    }
    else {
      entry.errorText("Geocode was not successful for the following reason: " + status);
      console.log(entry.errorText());
    }
  }
}

function placeMarker(position, map) {

  if (tempMarker.marker)
    tempMarker.marker.setMap(null);

  // run the geocoder with the callback
  geocoder.geocode({
    location: position
  }, makeGeocodeCallback(tempMarker, function (entry) {
    // after the marker is places, open the mapInfo immediately
    mapInfo.setContent("<strong>" + entry.title + "</strong><br/><div id=\"infoWindowImage\" >loading Image</div>");
    mapInfo.open(entry.marker.get('map'), entry.marker);
    if (!entry.imagesLoaded)
      asyncLoadImages(entry, 5, function () {
        buildImageHtml($("#infoWindowImage"), entry);
      });
    else
      buildImageHtml($("#infoWindowImage"), entry);
  }));

  //map.panTo(position);
}

function fitMapToMarkers() {

  var countMarkers = 0;
  // fit the viewport to all visible markers
  var bounds = new google.maps.LatLngBounds();
  //  Go through each...
  for (var i = 0; i < mapData.length; i++) {
    var entry = mapData[i];
    //  only extend the bounds if the entry has a marker, the marker is visible on the map and the marker has a lat/lng position
    if (entry.marker && entry.marker.getMap() == map && entry.position) {
      bounds.extend(entry.position);
      countMarkers++;
    }
  }

  if (tempMarker && tempMarker.marker && tempMarker.marker.getMap() == map && tempMarker.position) {
    bounds.extend(tempMarker.position);
    countMarkers++;
  }

  //  Fit these bounds to the map
  if (countMarkers > 0)
    map.fitBounds(bounds);
}

var REQUEST_URL = 'http://www.panoramio.com/map/get_panoramas.php?set=public&from=0&to=20&size=medium&mapfilter=true';

var HTML_IMAGE = '<div class="asyncImage"><a href="%url%" target="_blank"><img src="%src%" width="100px" /></a><br/><p><strong>Title: </strong>%title%<br/><strong>Credits: </strong>%credits%</p></div>';

function buildImageHtml(placeholder, entry) {
  placeholder.empty();

  var html = "";
  var images = entry.images();
  for (var i = 0; i < images.length; i++) {
    var image = images[i];
    html += HTML_IMAGE.replace("%src%", image.photo_file_url).replace("%url%", image.photo_url).replace("%title%", image.photo_title).replace("%credits%", image.owner_name);
  }

  if (images.length == 0) {
    if (entry.error)
      html = entry.errorText();
    else
      html = "no pictures found";
  }

  placeholder.html(html);
}

// asynchronously load images to the currently selected marker
function asyncLoadImages(entry, maxCount, callback) {
  // build the url
  var position = entry.position;

  var ll = "&minx=" + (position.lng() - 0.0005) + "&miny=" + (position.lat() - 0.0005) + "&maxx=" + (position.lng() + 0.0005) + "&maxy=" + (position.lat() + 0.0005);
  var url = REQUEST_URL + ll;

  entry.images.removeAll();

  // place the request
  $.ajax({
    url: url,
    dataType: "jsonp",
    // in case of success add the images into the placeholder 
    success: function (data) {
      if (data.photos.length > 0) {
        for (var i = 0; i < data.photos.length && i < maxCount; i++)
          entry.images.push(data.photos[i]);
      }
      entry.imagesLoaded = true;
      entry.showLoading(false);

      if (entry.images().length == 0)
        entry.errorText("no pictures found");

      if (callback)
        callback();
    },
    // ajax error handling
    error: function () {
      entry.errorText("ups, something went wrong! please retry");
      if (callback)
        callback();
    }
  });
}

google.maps.event.addDomListener(window, 'load', initMap);
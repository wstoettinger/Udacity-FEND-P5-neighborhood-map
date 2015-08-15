'use strict';

// this is a callback which is executed after the google maps script has been loaded asynchronously
window.initialize = function () {

  // this needs to happen after the google maps api is loaded
  var ko = require('knockout');
  var model = require('./viewmodel.js');

  /*  ko.components.register('info-window-content', {
      viewModel: require('../components/info-window-content.js'),
      template: require('../components/info-window-content.html.js')
    });*/

  ko.applyBindings(model);
  model.initialize();
};

window.loadScript = function () {
  // Asynchronously load the google maps script:
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' +
    //'&signed_in=true' + // user is signed-in, otherwise anonymous
    //'&key=AIzaSyAgG57YiwjH-smycCHYTtClGJzfK833q24' + // the api key or &sensor=false
    '&sensor=false' + // no api-key needed
    '&libraries=places' + // add the places library 
    '&callback=initialize'; // call the initialize function after loaded
  document.body.appendChild(script);
};

window.onload = loadScript;
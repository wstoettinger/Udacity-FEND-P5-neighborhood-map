'use strict';

var ViewModel = function () {
  var self = this;

  var settings = require('./settings.js');

  //
  // Contact Info
  //
  self.contactInfo = ko.observable(settings.ContactInfo);

  // extending the contact info with a computed observable for the full name
  self.contactInfo().fullName = ko.computed(function () {
    return this.first_name + " " + this.last_name;
  }, self.contactInfo());

  //
  // Search
  //
  self.searchOptions = ko.mapping.fromJS(settings.searchOptions);

  //
  // Map
  //

  //
  // Saved Locations
  //
};
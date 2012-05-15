(function (exports) {
  'use strict';
  /*jshint node:true */

  var request, fs, hub, scrape, ROOT_URL;

  ROOT_URL = process.env.ROOT_URL;
  request = require('request');
  hub = require('node-pubsub');
  fs = require('fs');

  console.log('Beginning scrape of', ROOT_URL);

  scrape = function (options) {
  };

  scrape(ROOT_URL);

})( exports );

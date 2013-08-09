(function() {
  var ROOTURL, async, docer, hub, indexqueue, liner, request, writer;

  ROOTURL = process.env.ROOTURL || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";

  liner = require('./liner');

  docer = require('./docer');

  async = require('async');

  request = require('request');

  hub = require('node-pubsub');

  writer = require('./writer');

  (require('source-map-support')).install();

  if (process.env.TESTING) {
    require('./test/mocks');
  }

  if (process.env.TESTING) {
    console.log("Testing");
  }

  indexqueue = async.queue(function(parentDoc, cb) {
    return request(parentDoc.url, function(err, resp, body) {
      var line, lines, _fn, _i, _len;
      console.log(body);
      lines = liner(body);
      _fn = function(line) {
        var doc;
        doc = docer(parentDoc.url, line);
        return hub.publish('/docs', [doc]);
      };
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        _fn(line);
      }
      return cb();
    });
  });

  hub.subscribe('/docs', writer.listen);

  indexqueue.push({
    url: ROOTURL
  });

}).call(this);

/*
//@ sourceMappingURL=indexer.js.map
*/
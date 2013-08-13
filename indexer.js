(function() {
  var Indexer, async, docer, liner, request;

  liner = require('./liner');

  docer = require('./docer');

  async = require('async');

  request = require('request');

  (require('source-map-support')).install();

  module.exports = Indexer = (function() {
    function Indexer(hub, root) {
      var _this = this;
      this.hub = hub;
      this.root = root;
      this.root = this.root || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";
      this.queue = async.queue(function(parentDoc, cb) {
        return request(parentDoc.url, function(err, resp, body) {
          var line, lines, _fn, _i, _len;
          lines = liner(body);
          _fn = function(line) {
            var doc;
            doc = docer(parentDoc.url, line);
            _this.hub.publish('/docs', [doc]);
            if ((doc.url.slice(-1)) === "/") {
              return _this.queue.push(doc);
            }
          };
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            _fn(line);
          }
          return cb();
        });
      });
    }

    Indexer.prototype.go = function(callback) {
      this.queue.drain = callback;
      return this.queue.push({
        url: this.root
      });
    };

    return Indexer;

  })();

}).call(this);

/*
//@ sourceMappingURL=indexer.js.map
*/
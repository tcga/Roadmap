(function() {
  var filename, fs, stream;

  fs = require('fs');

  filename = process.cwd() + "/out/" + Date.now() + ".json";

  stream = fs.createWriteStream(filename);

  module.exports = {
    listen: function(msg, cb) {
      return stream.write(JSON.stringify(msg, null, 2), cb);
    },
    close: function(cb) {
      return stream.end(cb);
    },
    open: function(cb) {
      filename = process.cwd() + "/out/" + Date.now() + ".json";
      stream = fs.createWriteStream(filename);
      return typeof cb === "function" ? cb() : void 0;
    },
    filename: filename
  };

}).call(this);

/*
//@ sourceMappingURL=writer.js.map
*/
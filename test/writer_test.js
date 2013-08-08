(function() {
  var fs, writer;

  writer = require("../writer");

  fs = require('fs');

  module.exports = {
    tearDown: function(cb) {
      return writer.close(fs.unlink(writer.filename, cb));
    },
    writeone: function(assert) {
      var msg;
      msg = {
        url: "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/",
        type: "DiseaseStudy",
        name: "brca",
        lastModified: "2012-06-18"
      };
      writer.listen(msg);
      return fs.readFile(writer.filename, function(err, data) {
        assert.equal(err, null);
        assert.deepEqual(JSON.parse(data), msg);
        return assert.done();
      });
    }
  };

}).call(this);

/*
//@ sourceMappingURL=writer_test.js.map
*/
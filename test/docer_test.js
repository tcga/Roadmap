(function() {
  var docer;

  docer = require("../docer");

  module.exports = {
    DiseaseStudy: function(assert) {
      var doc, expectedDoc, line, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/";
      line = "<a href=\"brca/\">brca/</a>                                          2012-06-18";
      doc = docer(url, line);
      expectedDoc = {
        url: url,
        type: "DiseaseStudy",
        name: "brca",
        lastModified: "2012-06-18"
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    },
    File: function(assert) {
      var doc, expectedDoc, line, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_2.1.0.0/mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt";
      line = "<a href=\"mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt\">mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt</a>           2011-12-06";
      doc = docer(url, line);
      expectedDoc = {
        url: url,
        type: "File",
        name: "mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt",
        diseaseStudy: "gbm",
        centerType: "cgcc",
        centerDomain: "mdanderson.org",
        platform: "mda_rppa_core",
        dataType: "protein_exp",
        archive: "mdanderson.org_GBM.MDA_RPPA_Core.Level_2.1.0.0",
        lastModified: "2011-12-06"
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    }
  };

}).call(this);

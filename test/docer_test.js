(function() {
  var docer;

  docer = require("../docer");

  module.exports = {
    diseasestudy: function(assert) {
      var doc, expectedDoc, line, name, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";
      line = "<a href=\"brca/\">brca/</a>                                          2012-06-18";
      name = "brca";
      doc = docer(url, line);
      expectedDoc = {
        url: url + name + "/",
        type: "DiseaseStudy",
        name: name,
        lastModified: "2012-06-18"
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    },
    file: function(assert) {
      var doc, expectedDoc, line, name, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_2.1.0.0/";
      line = "<a href=\"mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt\">mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt</a>           2011-12-06";
      name = "mdanderson.org_GBM.MDA_RPPA_Core.SuperCurve.Level_2.00da2077-778c-418a-9c92-01febd970ed8.txt";
      doc = docer(url, line);
      expectedDoc = {
        url: url + name,
        type: "File",
        name: name,
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
    },
    archive: function(assert) {
      var doc, expectedDoc, line, name, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/cesc/cgcc/jhu-usc.edu/humanmethylation450/methylation/";
      line = "<a href=\"jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz\">jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz</a>                                      2012-10-05";
      name = "jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz";
      doc = docer(url, line);
      expectedDoc = {
        url: url + name,
        type: "Archive",
        name: name,
        lastModified: "2012-10-05"
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    },
    archivehash: function(assert) {
      var doc, expectedDoc, line, name, url;
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/cesc/cgcc/jhu-usc.edu/humanmethylation450/methylation/";
      line = "<a href=\"jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz.md5\">jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz.md5</a>                                      2012-10-05";
      name = "jhu-usc.edu_CESC.HumanMethylation450.Level_1.1.0.0.tar.gz.md5";
      doc = docer(url, line);
      expectedDoc = {
        url: url + name,
        type: "Archive",
        name: name,
        lastModified: "2012-10-05"
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    },
    toplevelreadme: function(assert) {
      var doc, expectedDoc, line, name, url;
      line = "<a href=\"README_BCR.txt\">README_BCR.txt</a>                                 2012-07-27";
      url = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";
      name = "README_BCR.txt";
      doc = docer(url, line);
      expectedDoc = {
        url: url + name,
        type: "File",
        name: name,
        lastModified: "2012-07-27",
        diseaseStudy: '',
        centerType: void 0,
        centerDomain: void 0,
        platform: void 0,
        dataType: void 0,
        archive: void 0
      };
      assert.deepEqual(doc, expectedDoc);
      return assert.done();
    }
  };

}).call(this);

/*
//@ sourceMappingURL=docer_test.js.map
*/
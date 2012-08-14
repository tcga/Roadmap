(function () {
  'use strict';
  /*jshint node:true*/
  /*global describe:false it:false*/

  var expect, Resource;

  expect = require("expect.js");
  Resource = require("../resource");

  describe("Resource Creation", function () {

    it("creation of DiseaseStudy resources", function () {
      var line, parents, resource, root;
      line = '      <a href="blca/">blca/</a>                                          03-Apr-2012 19:57    - ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('blca');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/blca/');
      expect(resource.type).to.be('DiseaseStudy');
      expect(resource.lastModified).to.be('2012-04-03');
    });

    it("creation of CenterType resources", function () {
      var line, parents, resource, root;
      line = '      <a href="bcr/">bcr/</a>                                                 20-Jun-2012 04:29    -   ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('bcr');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/bcr/');
      expect(resource.type).to.be('CenterType');
      expect(resource.lastModified).to.be('2012-06-20');
    });

    it("creation of CenterDomain resources", function () {
      var line, parents, resource, root;
      line = '      <a href="mdanderson.org/">mdanderson.org/</a>                                          06-Dec-2011 17:02    -  ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('mdanderson.org');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/');
      expect(resource.type).to.be('CenterDomain');
      expect(resource.lastModified).to.be('2011-12-06');
    });

    it("creation of Platform resources", function () {
      var line, parents, resource, root;
      line = '      <a href="humanhap550/">humanhap550/</a>                                                  04-Jan-2011 17:01    -   ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/hudsonalpha.org/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('humanhap550');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/hudsonalpha.org/humanhap550/');
      expect(resource.type).to.be('Platform');
      expect(resource.lastModified).to.be('2011-01-04');
    });

    it("creation of DataType resources", function () {
      var line, parents, resource, root;
      line = '      <a href="methylation/">methylation/</a>                                                               07-Mar-2012 20:46    -   ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('methylation');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/');
      expect(resource.type).to.be('DataType');
      expect(resource.lastModified).to.be('2012-03-07');
    });

    it("creation of Archive resources", function () {
      var line, parents, resource, root;
      line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0/">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0/</a>                                            07-Mar-2012 20:44    -  ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0/');
      expect(resource.type).to.be('Archive');
      expect(resource.lastModified).to.be('2012-03-07');
    });

    it("creation of Archive resources", function () {
      var line, parents, resource, root;
      line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz</a>                                            07-Mar-2012 20:44    -  ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz');
      expect(resource.type).to.be('Archive');
      expect(resource.lastModified).to.be('2012-03-07');
      expect(resource.scrapeChildren).to.be(false);
    });

    it("creation of Archive resources", function () {
      var line, parents, resource, root;
      line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5</a>                                            07-Mar-2012 20:44    -  ';
      parents = {};
      root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
      resource = new Resource(line, root, parents);

      expect(resource).to.be.a(Resource);
      expect(resource.name).to.be('jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5');
      expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5');
      expect(resource.type).to.be('Archive');
      expect(resource.lastModified).to.be('2012-03-07');
      expect(resource.scrapeChildren).to.be(false);
    });
  });

})();

(function () {
	'use strict';
	/*jshint node:true*/
	/*global describe:false it:false beforeEach:false */

	var expect, rdfstore, Resource;

	expect = require("expect.js");
	rdfstore = require("rdfstore");
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
			expect(resource.scrapeChildren).to.be(true);
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
			expect(resource.scrapeChildren).to.be(true);
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
			expect(resource.scrapeChildren).to.be(true);
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
			expect(resource.scrapeChildren).to.be(true);
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
			expect(resource.scrapeChildren).to.be(true);
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
			expect(resource.scrapeChildren).to.be(true);
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

		it("creation of File resources", function () {
			var line, parents, resource, root;
			line = '      <a href="mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt">mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt</a>   06-Dec-2011 17:02  4.4K  ';
			parents = {
				"Archive" : "tcga:a6f8ee00-3b03-4a4a-8a6d-fad1d5ddb4f0",
				"CenterDomain" : "tcga:969ca34d-7ffe-47c2-a9d1-5a75f5d8efbd",
				"CenterType" : "tcga:934f9e7d-43cd-4d5c-8860-4d97a058d6e6",
				"DataType" : "tcga:43a9e968-9e23-4e1a-a00d-2a0505763935",
				"DiseaseStudy" : "tcga:76e3f705-48fc-4050-bf24-c4e484ad3f81",
				"Platform" : "tcga:86aea588-3cf2-4188-a9c2-f9e3f642c587"
			};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_3.1.0.0/';
			resource = new Resource(line, root, parents);

			expect(resource).to.be.a(Resource);
			expect(resource.name).to.be('mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt');
			expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_3.1.0.0/mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt');
			expect(resource.type).to.be('File');
			expect(resource.lastModified).to.be('2011-12-06');
			expect(resource.parents).to.be(parents);
			expect(resource.scrapeChildren).to.be(false);
		});

		it("creation of File resources", function () {
			var line, parents, resource, root;
			line = '      <a href="README_BCR.txt">README_BCR.txt</a>                                 27-Jul-2012 16:28  846   ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/';
			resource = new Resource(line, root, parents);

			expect(resource).to.be.a(Resource);
			expect(resource.name).to.be('README_BCR.txt');
			expect(resource.url).to.be('https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/README_BCR.txt');
			expect(resource.type).to.be('File');
			expect(resource.lastModified).to.be('2012-07-27');
			expect(resource.parents).to.be(parents);
			expect(resource.scrapeChildren).to.be(false);
		});
	});

	describe("Resources as N Triples", function () {

		var store, nonFileQuery, fileQuery;

		beforeEach( function () {
			store = new rdfstore.Store();
			store.registerDefaultProfileNamespaces();
			store.registerDefaultNamespace("tcga", "http://purl.org/tcga/core#");
			nonFileQuery = [
				"SELECT ?type ?url ?name WHERE {",
				" ?s a ?type .",
				" ?s rdfs:label ?name .",
				" ?s tcga:url ?url .",
				"}"
			].join("\n");
			fileQuery = [
				"SELECT ?type ?url ?name ?DiseaseStudy ?CenterType ?CenterDomain ?Platform ?DataType ?Archive WHERE {",
				" ?s a ?type .",
				" ?s rdfs:label ?name .",
				" ?s tcga:url ?url .",
				" ?s tcga:diseaseStudy ?DiseaseStudy .",
				" ?s tcga:centerType ?CenterType .",
				" ?s tcga:centerDomain ?CenterDomain .",
				" ?s tcga:platform ?Platform .",
				" ?s tcga:dataType ?DataType .",
				" ?s tcga:archive ?Archive .",
				"}"
			].join("\n");
		});

		it("DiseaseStudy resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="blca/">blca/</a>                                          03-Apr-2012 19:57    - ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#DiseaseStudy');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("CenterType resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="bcr/">bcr/</a>                                                 20-Jun-2012 04:29    -   ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#CenterType');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("CenterDomain resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="mdanderson.org/">mdanderson.org/</a>                                          06-Dec-2011 17:02    -  ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#CenterDomain');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("Platform resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="humanhap550/">humanhap550/</a>                                                  04-Jan-2011 17:01    -   ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/hudsonalpha.org/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#Platform');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("DataType resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="methylation/">methylation/</a>                                                               07-Mar-2012 20:46    -   ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#DataType');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("Archive resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0/">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0/</a>                                            07-Mar-2012 20:44    -  ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#Archive');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("Archive resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz</a>                                            07-Mar-2012 20:44    -  ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#Archive');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("Archive resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5">jhu-usc.edu_KIRP.HumanMethylation450.Level_1.1.0.0.tar.gz.md5</a>                                            07-Mar-2012 20:44    -  ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/kirp/cgcc/jhu-usc.edu/humanmethylation450/methylation/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#Archive');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});

		it("File resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt">mdanderson.org_GBM.MDA_RPPA_Core.protein_expression.Level_3.00da2077-778c-418a-9c92-01febd970ed8.txt</a>   06-Dec-2011 17:02  4.4K  ';
			parents = {
				"Archive" : "tcga:a6f8ee00-3b03-4a4a-8a6d-fad1d5ddb4f0",
				"CenterDomain" : "tcga:969ca34d-7ffe-47c2-a9d1-5a75f5d8efbd",
				"CenterType" : "tcga:934f9e7d-43cd-4d5c-8860-4d97a058d6e6",
				"DataType" : "tcga:43a9e968-9e23-4e1a-a00d-2a0505763935",
				"DiseaseStudy" : "tcga:76e3f705-48fc-4050-bf24-c4e484ad3f81",
				"Platform" : "tcga:86aea588-3cf2-4188-a9c2-f9e3f642c587"
			};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/gbm/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_GBM.MDA_RPPA_Core.Level_3.1.0.0/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(fileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#File');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					Object.keys(parents).forEach( function (parent) {
						expect(bindings[parent].value).to.be("http://purl.org/tcga/core#" + parents[parent].slice(5));
					});
					done();
				});
			});
		});

		it("File resources as n triples", function (done) {
			var line, parents, resource, root, ntriples;
			line = '      <a href="README_BCR.txt">README_BCR.txt</a>                                 27-Jul-2012 16:28  846   ';
			parents = {};
			root = 'https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/';
			resource = new Resource(line, root, parents);
			ntriples = resource.asNTriples();
			store.execute("INSERT DATA {"+ntriples+"}", function (success){
				store.execute(nonFileQuery, function (success, graph){
					delete global.token; // rdfstore leaks a global named 'token'
					var bindings = graph[0];
					expect(graph.length).to.be(1);
					expect(bindings.type.value).to.be('http://purl.org/tcga/core#File');
					expect(bindings.url.value).to.be(resource.url);
					expect(bindings.name.value).to.be(resource.name);
					done();
				});
			});
		});
	
	});

})();

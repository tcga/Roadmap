(function () {
	'use strict';
	/*jshint node:true*/
	/*global describe:false it:false*/

	var expect, scraper;

	expect = require("expect.js");
	scraper = require("../scraper.js");

	describe("Scraper", function (){

		it("Should expose Query and Resource", function () {
			expect(scraper.Query).not.to.be(undefined);
			expect(scraper.Resource).not.to.be(undefined);
		});

	});

})();
'use strict';
/*jshint node:true globalstrict:true*/

var fs, Writer;

fs = require('fs');

Writer = (function (){
	var instantiated, init;

	init = function () {

		var writer = {}, fileName;

		fileName = "/tcgascrape"+Date.now()+".nt";

		writer.stream = fs.createWriteStream(process.cwd()+fileName);

		writer.listen = function (msg) {
			var triples = msg.triples;
			writer.stream.write(triples);
		};

		writer.close = function () {
			writer.stream.end();
		};

		return writer;

	};

	return {
		getInstance : function () {
			if (!instantiated) instantiated = init();
			return instantiated;
		}
	};
})();

module.exports = Writer;
'use strict';
/*jshint node:true globalstrict:true*/

var request, Query;

request = require('request');

Query = (function (){
	var instantiated, init;

	init = function () {

		var query = {}, url, triples;

		triples = [];

		query.url = function (_) {
			if (!_) return url;
			else url = _;
			return query;
		};

		query.listen = function (msg) {
			if (!url) throw new Error("URL must be set before queries may be executed");
			triples.push(msg.triples);
			if (triples.length > 100) query.write();
		};

		query.write = function (){
			var insertQuery;
			insertQuery = 'INSERT DATA {\n'+triples.join("")+'\n}';
			triples = [];
			query.execute(insertQuery, function (error, response, body) {
				if (error || response.statusCode !== 200) {
					console.log("Unable to load triples:", insertQuery, error);
					return;
				}
			});
		};

		query.flush = function () {
			query.write();
		};

		query.execute = function (query, callback) {
			request({
				url : url+encodeURIComponent(query),
				method : "POST"
			}, callback);
		};

		return query;
	};

	return {
		getInstance : function () {
			if (!instantiated) instantiated = init();
			return instantiated;
		}
	};

})();

module.exports = Query;

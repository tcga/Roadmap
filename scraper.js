(function (exports) {
	'use strict';
	/*jshint node:true */

	var request, fs, hub, scrape, writer, Writer, ROOT_URL, getKnownEntities, types, logger,
		uuid, knownEntities, Sync, SPARQLURL, Query, query, NOW, diseaseFiles, getDiseaseFiles;

	ROOT_URL = process.env.ROOT_URL;
	SPARQLURL = process.env.SPARQLURL;
	request = require('request');
	hub = require('node-pubsub');
	fs = require('fs');
	NOW = (new Date()).toISOString(); //add .slice(0,10) to get date only.

	// Generate a UUID
	uuid = function uuid(a){
		//Function from https://gist.github.com/982883 (@jed)
		return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
	};

	// Semaphore from https://gist.github.com/1296828
	Sync = function Sync(syncCount, callback, preventInstantCallbackExecution) {
		this.syncCount = syncCount;
		this.callback = callback;
		if(preventInstantCallbackExecution === false && this.syncCount === 0) {
			this.executeCallback();
		}
		Sync.prototype.decrement = function() {
			--this.syncCount;
			if(this.syncCount === 0) {
				this.executeCallback();
			}
		};
		Sync.prototype.increment = function() {
			++this.syncCount;
		};
		Sync.prototype.executeCallback = function() {
			if (typeof this.callback === "function") this.callback();
		};
	};


	// Writer Singleton
	Writer = (function (){
		var instantiated, init;

		init = function () {

			var writer = {}, fileName;

			fileName = "/tcgascrape"+Date.now()+".nt";

			writer.stream = fs.createWriteStream(process.cwd()+fileName);

			writer.listen = function (msg) {
				var triples = msg.triples;
				writer.stream.write(triples.join("\n"));
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

	// Query Singleton
	Query = (function (){
		var instantiated, init;

		init = function () {

			var query = {}, url, triples;

			url = process.env.SPARQLURL.slice(0,-7);
			triples = [];

			query.url = function (_) {
				if (!_) return url;
				else url = _.slice(0,-7);
				return query;
			};

			query.listen = function (msg) {
				triples = triples.concat(msg.triples);
				if (triples.length > 1000) query.write();
			};

			query.write = function (){
				var insertQuery;
				insertQuery = 'prefix franzOption_logQuery: <franz:yes>\n INSERT DATA {\n'+triples.join("\n")+'\n}';
				triples = [];
				query.execute(insertQuery, function (error, response, body) {
					if (error || response.statusCode >= 300) {
						console.log("Unable to load triples:", insertQuery, error);
						console.log(response.statusCode, response.body);
						return;
					}
				});
			};

			query.flush = function () {
				query.write();
			};

			query.execute = function (query, callback) {
				request({
					url : url,
					method : "POST",
					form : {
						query : query
					}
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

	types = {
		9 : "DiseaseStudy",
		diseaseStudy : "DiseaseStudy",
		10 : "CenterType",
		11 : "CenterDomain",
		12 : "Platform",
		13 : "DataType",
		14 : "Archive",
		archive : "Archive",
		15 : "File",
		file : "File"
	};

	knownEntities = {};

	diseaseFiles = {};

	getKnownEntities = function (callback) {
		var query;

		query = [
			'prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>',
			'prefix tcga:<http://purl.org/tcga/core#>',
			'prefix franzOption_logQuery: <franz:yes>',
			'select distinct ?url ?id where {',
			'	?id tcga:url ?url .',
			'	{',
			'		?id a tcga:DiseaseStudy .',
			'	} UNION {',
			'		?id a tcga:CenterType .',
			'	} UNION {',
			'		?id a tcga:CenterDomain .',
			'	} UNION {',
			'		?id a tcga:Platform .',
			'	} UNION {',
			'		?id a tcga:DataType .',
			'	} UNION {',
			'		?id a tcga:Archive .',
			'	}',
			'}'
		].join(' ');

		request({
				method : "POST",
				url : SPARQLURL+encodeURIComponent(query),
				headers : { "Accept" : "application/sparql-results+json" }
			}, function ( error, response, body ) {

				if (response.statusCode === 204) {
					console.log('Found no known entities.');
					return callback();
				}

				if (error || response.statusCode !== 200) {
					console.log("Unable to query SPARQL endpoint");
					return;
				}

				var bindings;

				bindings = JSON.parse(body).results.bindings;

				bindings.forEach(function (binding) {
					knownEntities[binding.url.value] = binding;
				});

				console.log('Found', bindings.length, 'entities.');

				return callback();
		});
	};

	getDiseaseFiles = function (disease, callback) {
		var query;

		diseaseFiles = {};

		query = [
			'prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#>',
			'prefix tcga:<http://purl.org/tcga/core#>',
			'prefix franzOption_logQuery: <franz:yes>',
			'select distinct ?url ?id where {',
			'	?id tcga:url ?url .',
			'	?id tcga:diseaseStudy ?d .',
			'	?d rdfs:label "'+disease+'" .',
			'}'
		].join(' ');

		request({
				method : "POST",
				url : SPARQLURL+encodeURIComponent(query),
				headers : { "Accept" : "application/sparql-results+json" }
			}, function ( error, response, body ) {

				if (response.statusCode === 204) {
					console.log("Found no entities for", disease, ".");
					return callback();
				}

				if (error || response.statusCode !== 200) {
					console.log("Unable to query SPARQL endpoint for",disease,"files.");
					return;
				}

				var bindings;

				bindings = JSON.parse(body).results.bindings;

				bindings.forEach(function (binding) {
					diseaseFiles[binding.url.value] = binding;
				});

				console.log('Found', bindings.length, 'entities for', disease,'.');

				return callback();
		});

	};

	scrape = function (options) {
		var opts, target, parent, callback, start, callCallback;

		opts = options || {};
		target = opts.target || ROOT_URL;
		parent = opts.parent || {};

		callCallback = function () {
			if (callback && typeof callback === 'function') callback();
		};
		callback = opts.callback;

		request(target, function (error, response, body) {

			if (error || response.statusCode !== 200) {
				console.log("Failed to get", target);
				return callCallback();
			}

			else {

				var pre, rows, children = [], tcga, literal;

				tcga = function (name) { return "<http://purl.org/tcga/core#"+name+">"; };
				literal = function (value) { return '"'+value+'"'; };
				pre = body.match(/<pre>([\s\S]*)<\/pre>/);
				if (!pre) {
					console.log("Could not parse (pre)", target);
					return callCallback();
				} else pre = pre[1];
				rows = pre.match(/<a[^>]+>[^<]+<\/a>\s+[\d-]{10}/g);

				if (rows) rows.forEach(function (row) {

					var name, id, url, type, tripleString, lastModified, subject, scrapeChildren = true, level;

					name = row.match(/>([\s\S]*)</);
					if (!name) console.log("Could not parse (name)", row); else name = name[1];
					id = uuid();
					url = target + row.match(/href="(.*)"/)[1];
					level = target.split('/').length;
					type = types[level];
					try {
						lastModified = (new Date(row.match(/\s([\d-]{10})/)[1])).toISOString().slice(0,10);
					} catch (e) {
						console.log("Row:", row);
						process.exit(1);
					}
					tripleString = "";

					if ((process.env.TESTING && level === 10) || level >= 15) {
						scrapeChildren = false;
						if (target.match(/ucec|thca|stad/)) scrapeChildren = true;
					}

					if (name === 'lost+found/') return;

					name = name.trim();

					// Things with extensions are files (e.g. reallylong_name.tiff)
					// TODO Use MIME types to determine files.
					if (name.match(/^.*\.[^\/]+$/)) {
						type = types.file;
						scrapeChildren = false;
					}

					// Remove the trailing "/"
					if (name.charAt(name.length-1) === "/") name = name.slice(0,-1);

					// If a file ends in .tar.gz or .tar.gz.md5, type it as an archive
					if (type === types.file && name.match(/\.tar\.gz($|\.md5$)/)) {
						type = types.archive;
					}

					// If a file is of the form
					// <domain>_<disease study>.<platform>.<archive type>.<serial index>.<revision>.<series>
					// type it as an archive
					if (name.match(/.*?_(.*?\.){5}\d$/)) {
						type = types.archive;
					}

					// Either insert or update, based on whether this item exists in the known entities.
					if (!knownEntities[url] && !diseaseFiles[url]) {
						var entity = {
							id : { value : id },
							newEntity : true
						};
						if (type !== types.file) knownEntities[url] = entity;
						else diseaseFiles[url] = entity;
						subject = id.length === 36 ? tcga(id) : "<" + id + ">";
						tripleString = [
							subject, tcga("lastSeen"), literal(NOW), ".\n",
							subject, tcga("firstSeen"), literal(NOW), ".\n",
							subject, "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",  tcga(type), ".\n",
							subject, "<http://www.w3.org/2000/01/rdf-schema#label>", literal(name), ".\n",
							subject, tcga("url"), literal(url), ".\n"
						];

						if (type === types.file || types === types.archive) {
							tripleString.push(subject, tcga("lastModified"), literal(lastModified), ".\n");
						}

						if (type === types.file) {
							var ancestor;
							Object.keys(parent).forEach(function (ancestor) {
								// Make the first letter lowercase
								var property = ancestor.charAt(0).toLowerCase() + ancestor.slice(1);
								tripleString.push(subject, tcga(property), parent[ancestor], ".\n");
							});
						}
					}
					else {
						if (knownEntities[url]) id = knownEntities[url].id.value;
						else id = diseaseFiles[url].id.value;
						subject = id.length === 36 ? tcga(id) : "<" + id + ">";
						tripleString = [
							subject, tcga("lastSeen"), literal(NOW), ".\n"
						];

						// Additional URLS may need to be added for new entities, such as center types.
						if (knownEntities[url] && knownEntities[url].newEntity) {
							tripleString.push(subject, tcga("url"), literal(url), ".\n");
						}
					}

					hub.publish('/triples', [{
						triples : tripleString.join("").split("\n"),
						type : type,
						name : name
					}]);

					if (scrapeChildren){
						var child;
						parent[type] = subject;
						child = {target:url, parent:JSON.parse(JSON.stringify(parent))};
						if (type == types.diseaseStudy) {
							child.type = type;
							child.name = name;
						}
						children.push(child);
					}

				});

				if (children.length > 0) {
					var counter = new Sync(children.length, callback);
					var nextChild = function nextChild(children){
						var child = children.pop();
						if (child){
							child.callback = function(){
								counter.decrement();
								nextChild(children);
							};
							if (child.type === types.diseaseStudy) {
								getDiseaseFiles(child.name, function () {
									scrape(child);
								});
							} else {
								scrape(child);
							}
						}
					};
					nextChild(children);
				}
				else callCallback();

			}

		});
	};

	//writer = Writer.getInstance();

	query = Query.getInstance().url(process.env.SPARQLURL);

	hub.subscribe('/triples', query.listen);

	//hub.subscribe('/triples', writer.listen);

	console.log('Getting known entities from hub.');

	getKnownEntities(function (err) {
		if (err) console.log(err);
		console.log('Beginning scrape of', ROOT_URL);
		scrape({
			target : ROOT_URL,
			callback : function () {
				Query.getInstance().flush();
				// writer.close();
				console.log("Scrape finished");
			}
		});
	});

})( exports );

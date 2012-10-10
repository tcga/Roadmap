'use strict';
/*jshint node:true globalstrict:true*/

var uuid, types, Resource, NOW, tcga, literal;

// Generate a UUID
uuid = function uuid(a){
	//Function from https://gist.github.com/982883 (@jed)
	return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
};

tcga = function (name) { return "<http://purl.org/tcga/core#"+name+">"; };
literal = function (value) { return '"'+value+'"'; };

// Types of resources at the TCGA
types = {
	9 : "DiseaseStudy",
	10 : "CenterType",
	11 : "CenterDomain",
	12 : "Platform",
	13 : "DataType",
	14 : "Archive",
	archive : "Archive",
	15 : "File",
	file : "File"
};

// Current Time
NOW = (new Date()).toISOString(); //add .slice(0,10) to get date only.

Resource = function (line, root, parents) {
	var level, name, id, url, type, lastModified, scrapeChildren;

	// Parse the intial elements
	name = line.match(/>([\s\S]*)</);
	if (!name) console.log("Could not parse", line); else name = name[1];
	id = uuid();
	url = root + line.match(/href="(.*)"/)[1];
	level = root.split('/').length;
	type = types[level];
	lastModified = (new Date(line.match(/\d{2}-\w{3}-\d{4}/)[0])).toISOString().slice(0,10);
	scrapeChildren = true;

	// Get rid of trailing and leading whitespace
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

	this.name = name;
	this.id = id;
	this.url = url;
	this.type = type;
	this.lastModified = lastModified;
	this.scrapeChildren = scrapeChildren;
	this.parents = parents;
	this.subject = tcga(id);
};

Resource.prototype.asNTriples = function() {
	var triples, subject;

	subject = this.subject;
	triples = [
		subject, tcga("lastSeen"), literal(NOW), ".\n",
		subject, tcga("firstSeen"), literal(NOW), ".\n",
		subject, "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",  tcga(this.type), ".\n",
		subject, "<http://www.w3.org/2000/01/rdf-schema#label>", literal(this.name), ".\n",
		subject, tcga("url"), literal(this.url), ".\n"
	];

	if (this.type === types.file || types === types.archive) {
		triples.push(subject, tcga("lastModified"), literal(this.lastModified), ".\n");
	}

	if (this.type === types.file) {
		var ancestor, that = this;
		Object.keys(this.parents).forEach(function (ancestor) {
			// Make the first letter lowercase
			var property = ancestor.charAt(0).toLowerCase() + ancestor.slice(1);
			triples.push(subject, tcga(property), that.parents[ancestor], ".\n");
		});
	}

	return triples.join(" ");
};

module.exports = Resource;
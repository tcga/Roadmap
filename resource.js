'use strict';
/*jshint node:true globalstrict:true*/

var uuid, types, Resource;

// Generate a UUID
uuid = function uuid(a){
	//Function from https://gist.github.com/982883 (@jed)
	return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
};

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
};

module.exports = Resource;
(function (exports) {
  'use strict';
  /*jshint node:true */

  var request, fs, hub, scrape, writer, Writer, ROOT_URL, getKnownEntities, start,
      types, logger, uuid, knownEntities, Sync, SPARQLURL, Query, query, NOW, Resource;

  ROOT_URL = process.env.ROOT_URL;
  SPARQLURL = process.env.SPARQLURL;
  NOW = (new Date()).toISOString(); //add .slice(0,10) to get date only.

  request = require('request');
  hub = require('node-pubsub');
  Query = require('./query');
  Writer = require('./writer');
  Sync = require('./sync');
  Resource = require('./resource');

  knownEntities = {};

  getKnownEntities = function () {
    var query;

    query = [ 'prefix tcga:<http://purl.org/tcga/core#>',
              'select distinct ?name ?id where {',
              '  ?id rdfs:label ?name .',
              '}' ].join(' ');

    request({
        url : SPARQLURL+encodeURIComponent(query),
        headers : { "Accept" : "application/sparql-results+json" }
      }, function ( error, response, body ) {

        if (error || response.statusCode !== 200) {
          console.log("Unable to query SPARQL endpoint");
          return;
        }

        var bindings;

        bindings = JSON.parse(body).results.bindings;

        bindings.forEach(function (binding) {
          knownEntities[binding.name.value] = binding;
        });

        console.log('Found', bindings.length, 'entities.');

        console.log('Beginning scrape of', ROOT_URL);

        scrape({
          target : ROOT_URL,
          callback : function () {
            Query.getInstance().flush();
            writer.close();
            console.log("Scrape finished");
          }
        });
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
        rows = pre.match(/<a[^>]+>[^<]+<\/a>\s+\d{2}-\w{3}-\d{4}/g);

        if (rows) rows.forEach(function (row) {

          var name, id, url, type, tripleString, lastModified, subject, scrapeChildren = true, level;

          name = row.match(/>([\s\S]*)</);
          if (!name) console.log("Could not parse (name)", row); else name = name[1];
          id = uuid();
          url = target + row.match(/href="(.*)"/)[1];
          level = target.split('/').length;
          type = types[level];
          lastModified = (new Date(row.match(/\d{2}-\w{3}-\d{4}/)[0])).toISOString().slice(0,10);
          tripleString = "";

          if ((process.env.TESTING && level >= 10) || level >= 15) {
            scrapeChildren = false;
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
          if (!knownEntities[name]) {
            knownEntities[name] = {
              id : { value : id },
              newEntity : true
            };
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
            id = knownEntities[name].id.value;
            subject = id.length === 36 ? tcga(id) : "<" + id + ">";
            tripleString = [
              subject, tcga("lastSeen"), literal(NOW), ".\n"
            ];

            // Additional URLS may need to be added for new entities, such as center types.
            if (knownEntities[name].newEntity) {
              tripleString.push(subject, tcga("url"), literal(url), ".\n");
            }
          }

          hub.publish('/triples', [{
            triples : tripleString.join(" "),
            type : type,
            name : name
          }]);

          if (scrapeChildren){
            parent[type] = subject;
            children.push({target:url, parent:JSON.parse(JSON.stringify(parent))});
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
              scrape(child);
            }
          };
          nextChild(children);
        }
        else callCallback();

      }

    });
  };

  start = function () {

    writer = Writer.getInstance();

    query = Query.getInstance().url(SPARQLURL);

    hub.subscribe('/triples', query.listen);

    hub.subscribe('/triples', writer.listen);

    console.log('Getting known entities from hub.');

    getKnownEntities();

  };

  exports.Start = start;

})( exports );

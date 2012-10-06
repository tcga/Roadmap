(function (exports) {
  'use strict';
  /*jshint node:true */

  var request, fs, hub, scrape, writer, Writer, ROOT_URL, getKnownEntities,
      types, logger, uuid, knownEntities, Sync, SPARQLURL, Query, query, NOW;

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
        //triples = triples.split(" . ").join(" .\n");
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

  // Query Singleton
  Query = (function (){
    var instantiated, init;

    init = function () {

      var query = {}, url, triples;

      url = process.env.SPARQLURL;
      triples = [];

      query.url = function (_) {
        if (!_) return url;
        else url = _;
        return query;
      };

      query.listen = function (msg) {
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
              subject, tcga("url"), literal(url), ".\n",
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

  writer = Writer.getInstance();

  query = Query.getInstance().url(process.env.SPARQLURL);

  hub.subscribe('/triples', query.listen);

  hub.subscribe('/triples', writer.listen);

  console.log('Getting known entities from hub.')

  getKnownEntities();

})( exports );

(function (exports) {
  'use strict';
  /*jshint node:true */

  var request, fs, hub, scrape, writer, Writer, ROOT_URL, types, logger, uuid, knownEntities, Sync;

  ROOT_URL = process.env.ROOT_URL;
  request = require('request');
  hub = require('node-pubsub');
  fs = require('fs');

  console.log('Beginning scrape of', ROOT_URL);

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
    };
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

  // Writer Singleton
  Writer = (function (){
    var instantiated, init;

    init = function () {

      var writer = {}, fileName;

      fileName = "/tcgascrape"+Date.now()+".nt";

      writer.stream = fs.createWriteStream(process.cwd()+fileName);

      writer.listen = function (msg) {
        var triples = msg.triples;
        triples = triples.split(" . ").join(" .\n");
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

  types = {
    9 : "disease-study",
    10 : "center-type",
    11 : "center-domain",
    12 : "platform",
    13 : "data-type",
    14 : "archive",
    archive : "archive",
    15 : "file",
    file : "file"
  };

  knownEntities = {};

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
        if (callback && typeof callback === 'function') callback();
        else return;
      }

      else {

        var pre, rows, children = [], tcga, literal;

        tcga = function (name) { return "<http://purl.org/tcga/core#"+name+">"; };
        literal = function (value) { return '"'+value+'"'; };
        pre = body.match(/<pre>([\s\S]*)<\/pre>/);
        if (!pre) return callCallback(); else pre = pre[1];
        rows = pre.match(/<a[^?P]*?<\/a>[\s\S]+?\d{2}-\w{3}-\d{4}/g);

        if (rows) rows.forEach(function (row) {

          var name, id, url, type, tripleString, lastModified, subject, scrapeChildren = true, level;

          name = row.match(/>([\s\S]*)</);
          if (!name) console.log(row); else name = name[1];
          id = uuid();
          url = target + row.match(/href="(.*)"/)[1];
          level = target.split('/').length;
          type = types[level];
          lastModified = (new Date(row.match(/\d{2}-\w{3}-\d{4}/)[0])).toISOString().slice(0,10);
          tripleString = "";

          if ((process.env.TESTING && level >= 10) || level >= 15) {
            scrapeChildren = false;
          }

          // Things with extensions are files (e.g. reallylong_name.tiff)
          // TODO Use MIME types to determine files.
          if (name.match(/^.*\.[^\/]+$/)) {
            type = types.file;
            scrapeChildren = false;
          }

          // TODO when should this NOT be done (e.g. files)
          if (type !== types.file) name = name.slice(0,-1); // Remove the trailing "/"

          // If a file ends in .tar.gz or .tar.gz.md5, type it as an archive
          if (type === types.file && name.match(/\.tar\.gz($|\.md5$)/)) {
            type = types.archive;
          }

          if (type !== types.file && type !== types.archive) {
            if (!knownEntities[name]) knownEntities[name] = id;
            else id = knownEntities[name];
          }

          subject = tcga(id);
          tripleString = [
            subject, "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>",  tcga(type), ".",
            subject, "<http://www.w3.org/2000/01/rdf-schema#label>", literal(name), ".",
            subject, tcga("url"), literal(url), "."
          ];

          if (type === types.file) {
            var ancestor;
            Object.keys(parent).forEach(function (ancestor) {
              tripleString.push(subject, tcga(ancestor), parent[ancestor], ".");
            });
          }

          hub.publish('/triples', [{
            triples : tripleString.join(" ") + "\n",
            type : type,
            name : name
          }]);

          if (scrapeChildren){
            parent[type] = subject;
            children.push({target:url, parent:JSON.parse(JSON.stringify(parent))});
          }

        });

        //hub.publish('/triples', [ { triples : children } ]);

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

  //logger = hub.subscribe('/triples', function ( msg ) {
  //  console.log(msg.triples);
  //});

  writer = Writer.getInstance();

  hub.subscribe('/triples', writer.listen);

  scrape({
    target : ROOT_URL,
    callback : function () { writer.close(); console.log("Scrape finished"); }
  });

})( exports );

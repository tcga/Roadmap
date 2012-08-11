//
// TCGA Scraper
//
// A TCGA Web Toolbox Module that scrapes the TCGA http/ftp site
// into RDF triples and provides a query runner
//
//

(function(TCGA){

  var uuid, Sync, fsErrorCallback, Scraper, toArray;

  // Check for requirements, fail if not found
  if (!TCGA) { throw "TCGA required"; }

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

  // Generic onerror for filesystem calls
  fsErrorCallback = function fsErrorCallback(e) {
    var msg = '';
    console.error(e);

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    }

    console.log('Error: ' + msg);
  };

  // Utility function for converting
  toArray = function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
  };

  Scraper = {

    init : function init(){

      //Initialize the RDF Store
      rdfstore.connect("lib/rdf_store.js", function(success, store){
        store.registerDefaultProfileNamespaces();
        store.registerDefaultNamespace("tcga", "http://tcga.github.com/#");
        Scraper.store = store;
        console.log("RDF Store ready.");
      });

      //Initialize the File System
      window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
      Scraper.fileSystem = window.requestFileSystem(window.PERSISTENT, 500*1024*1024, function(newFs){
        Scraper.fileSystem = newFs;
        console.log("Filesystem ready.");
        Scraper.checkForRecentScrapes();
      }, fsErrorCallback);

      // Init the UI
      $("#query").submit(function(e){
        var query = $("#sparql", this).val();
        if(query !== ""){
          try {
            Scraper.store.execute(query, function(succ, resp){
              if(!succ){
                Scraper.postMessage("error", "Unable to execute query: " + query);
              }
              else {
                Scraper.parseResults(resp);
              }
            });
          }
          catch (e){
            Scraper.postMessage("error", "Unable to execute query: " + query);
          }
        }
        return false;
      });
      $("<p>").append($("<a class='btn btn-primary'>Start new Scrape</a>")
        .click(Scraper.scrape))
        .appendTo("#controls");
    },

    store : null,

    fileSystem : null,

    scrapeList : null,

    gui : '<h1>TCGA SPARQL Interface</h1><div class="row"><div class="span6"><form id="query"><div class="control-group"><div class="controls"><textarea class="span6" id="sparql" rows="10">SELECT * WHERE { ?s ?p ?o . } LIMIT 25</textarea><span class="help-inline"><p>Enter our SPARQL Query and click submit.</p></span></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">Submit Query</button> <button class="btn">Cancel</button></div></form></div><div id="controls" class="span6"><div id="message"></div><div id="scrapelist"></div></div><div id="results"></div>',

    nav : 'SPARQL',

    name : 'tcga-sparql',

    types : {
      9 : "tcga:disease-study",
      10 : "tcga:center-type",
      11 : "tcga:center-domain",
      12 : "tcga:platform",
      13 : "tcga:data-type",
      14 : "tcga:archive",
      archive : "tcga:archive",
      15 : "tcga:file",
      file : "tcga:file"
    },

    startSpinner : function(el){
      var spin = $("<img>").attr("src", "http://www.fbi.gov/spinner.gif");
      $(el).after(" ", $("<i class='spinner icon-blob'>").html(spin));
    },

    endSpinner : function(el){
      $("i.spinner", $(el).parent()).remove();
    },

    knownEntities : {},

    knownSubjects : { length:0 },

    scrape : function(options){
      var opts, target, store, parent, callback;

      // Parse Arguments
      opts = options || {};
      target = opts.url || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";
      store = opts.store || Scraper.store;
      parent = opts.parent || {};
      callback = opts.callback || null;

      if (!opts.url) console.log("Beginning scrape of: ",target);

      if (!Scraper.scraping) Scraper.scraping = true;

      if (!opts.parent) Scraper.startSpinner("a.btn-primary:contains('Start new Scrape')");

      TCGA.get(target, function(error, response){

        if (error) {
          console.error("Failed to get", target);
          return;
        }

        var links = $("a", $(response)),
            link, index, children = [],
            querystring = "@prefix tcga:<http://tcga.github.com/#> .\n @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> . \n";

        links.each(function(index, link){

          var name = $(link).attr('href'),
              id = uuid(),
              url = target + name,
              type = Scraper.types[target.split("/").length],
              scrapeChildren = true;

          // Filter out links beginning with ? or /
          // (i.e. column headers and parent links)
          if(name.match(/^[\?\/]/)) return;

          // Things with extensions are files (e.g. reallylong_name.tiff)
          // TODO Use MIME types to determine files.
          if(name.match(/^.*\.[^\/]+$/)){
            type = Scraper.types.file;
            scrapeChildren = false;
          }

          // TODO when should this NOT be done (e.g. files)
          if(type !== Scraper.types.file) name = name.slice(0,-1); // Remove the trailing "/"

          // Check for this objects presence in known objects
          if(type !== Scraper.types.file && type !== Scraper.types[14]){
            if (!Scraper.knownEntities[name]) Scraper.knownEntities[name] = id;
            else id = Scraper.knownEntities[name];
          }

          // If a file ends in .tar.gz or .tar.gz.md5, type it as an archive
          if(type === Scraper.types.file && name.match(/\.tar\.gz($|\.md5$)/)){
            type = Scraper.types.archive;
          }

          // Add this entity to known subjects
          var subject = 'http://tcga.github.com/#'+id;
          if(!Scraper.knownSubjects[subject]){
            Scraper.knownSubjects[subject] = true;
            Scraper.knownSubjects.length += 1;
          }

          // Build the query string
          querystring += 'tcga:'+id+' tcga:url "'+url+'" ;\n';
          querystring += "a "+type+" ;\n";
          if (type === Scraper.types.file){
            var ancestor;
            for (ancestor in parent){
              if (parent.hasOwnProperty(ancestor)){
                querystring += ancestor+" "+parent[ancestor]+" ;\n";
              }
            }
          }
          querystring += 'rdfs:label "'+name+'" .\n';

          // If the entity is not a file, put it's children on the stack to be scraped.
          if (scrapeChildren){// && (target.split("/").length > 9 || name > "stad")){ // && target.split("/").length <= 9){
            parent[type] = "tcga:"+id;
            children.push({store:store, url:url, parent:JSON.parse(JSON.stringify(parent))});
          }

        });

        // Insert the queries
        try{
          store.load("text/turtle", querystring, function(success, results){
            if (!success) {
              console.error("Unable to load data for", target, ":", results);
            }
            if (success){
              console.log("Parsed", target.slice(81), "into", results, "triples");
            }
            // Depth first traversal of children
            if (success && children.length > 0){
              var counter = new Sync(children.length, callback);
              var nextChild = function nextChild(children){
                var child = children.pop();
                if (child){
                  child.callback = function(){
                    counter.decrement();
                    nextChild(children);
                  };
                  Scraper.scrape(child);
                }
              };
              nextChild(children);
            }
            else {
              if (callback && typeof callback === 'function') callback();
            }

          });
        }
        catch(e){
          console.error("Failed to load triples for", target);
          console.dir(e);
          if (callback && typeof callback === 'function') callback();
        }

      });
    },

    load : function(scrapeToLoad, callback){
      var dirReader, scrapes = [], readEntries;

      if (!Scraper.fileSystem) {
        console.log("Unable to load scrape: filesystem not loaded");
        return;
      }

      Scraper.getScrapeList(function(scrapes){
        var scrape, scrapeDate, scrapeDateString;

        scrape = scrapeToLoad || scrapes[scrapes.length-1];
        scrapeDate = new Date(parseInt(scrape.name.match(/-([0-9]+)\./)[1],10));
        scrapeDateString = scrapeDate.toLocaleString().split(" ").slice(0,5).join(" ");
        console.log("Loading scrape from:", scrapeDate);
        scrape.file(function(scrapefile){
          var reader, partialResults = [];

          reader = new FileReader();

          Scraper.postMessage("info", ["Starting load of", scrape.name]);

          reader.onprogress = function(e){
            Scraper.postMessage("info", ["Successfully Loaded", parseInt(e.loaded / e.total * 100, 10)+"%", "of", scrape.name]);
          };

          reader.onloadend = function(e){
            Scraper.postMessage("info", ["Preparing Triplestore..."]);
            try {
            Scraper.store.load("text/turtle", this.result, function(succ, results){
              if (!succ) {
                Scraper.postMessage("error", ["Failed to load triples from scrape on", scrapeDateString]);
                console.error("Failed to load triples from scrape on", scrapeDate);
                return;
              }
              Scraper.postMessage("success", ["Loaded", results, "triples scraped on", scrapeDateString]);
              console.log("Loaded", results, "triples scraped on", scrapeDate);
            });
            } catch (e) {
              Scraper.postMessage("error", ["Failed to load triples from scrape on", scrapeDateString]);
              console.error("Failed to load triples from scrape on", scrapeDate);
            }
          };

          reader.readAsText(scrapefile);
        }, fsErrorCallback);
      });
    },

    getScrapeList : function(callback){
      var dirReader, scrapes = [], readEntries;

      if (!Scraper.fileSystem) {
        console.log("Unable get scrape list: filesystem not loaded");
        return;
      }

      dirReader = Scraper.fileSystem.root.createReader();
      readEntries = function() {
         dirReader.readEntries (function(results) {
          if (!results.length) {
            Scraper.scrapeList = scrapes;
            if (callback && typeof callback === 'function') callback(scrapes);
          } else {
            scrapes = scrapes.concat(toArray(results));
            readEntries();
          }
        }, fsErrorCallback);
      };
      readEntries(); // Start reading dirs.
    },

    save : function(callback){
      var filename = ["tcgascrape-",Date.now(),".nt"].join("");

      if (!Scraper.fileSystem) {
        Scraper.postMessage("error", "Unable to save scrape: filesystem not loaded");
        console.log("Unable to save scrape: filesystem not loaded");
        return;
      }

      Scraper.fileSystem.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry) {

        fileEntry.createWriter(function(fileWriter) {

          var url, subject, numRows, savedRows, rowCallback, writeVar, onreadyWrite;

          url = fileEntry.toURL();
          numRows = Scraper.knownSubjects.length;
          savedRows = 0;
          rowCallback = function(){
            if (++savedRows >= numRows){
            }
          };
          writeVar = Q.avar({ val:{fileWriter:fileWriter} });
          onreadyWrite = function (subject, fileWriter) {
            return function (evt) {
              Scraper.store.node(subject, function(succ, graph){

                var i;

                if (!succ) {
                  console.error("Unable to get graph for serialization");
                  return;
                }

                //fileWriter.seek(fileWriter.length); // Start at EOF

                fileWriter.onwriteend = function(e) {
                  if (++savedRows % 10000 === 0) console.log("Saved", savedRows,"rows out of", numRows);
                  return evt.exit();
                };

                fileWriter.onerror = function(e) {
                  return evt.fail(e);
                };

                var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
                for (i=0;i<graph.triples.length;i++){
                  bb.append(graph.triples[i].toString());
                }
                fileWriter.write(bb.getBlob('text/plain'));

              });
            };
          };
          writeVar.onerror = function(msg){
            console.error(e);
          };

          console.log("Beginning serialization of", numRows, "rows.");

          for (subject in Scraper.knownSubjects){
            if (subject === "length") continue;
            if (!(Scraper.knownSubjects.hasOwnProperty(subject))) continue;
            writeVar.onready = onreadyWrite(subject, fileWriter);
          }

          writeVar.onready = function (evt) {
            var now = new Date();
            console.log("savedRows:", savedRows, "numRows", numRows);
            Scraper.postMessage("success", ['Saved scrape from', now.toString()]);
            console.log('Saved scrape from', now.toString(), 'to', url);
            Scraper.endSpinner("a.btn-primary:contains('Start new Scrape')");
            Scraper.checkForRecentScrapes();
            if (callback && typeof callback === 'function') callback();
            return evt.exit();
          };

        });
      }, fsErrorCallback);
    },

    postMessage : function(type, message){
      var $msg = $("#message").detach().empty(),
          typeClass = "alert-"+type;

      if (typeof message === "object") message = message.join(" ");

      $msg.removeClass().addClass("alert").addClass(typeClass).text(message);

      $msg.prependTo("#controls");
    },

    parseResults : function parseResults(resp){
      var tableTemplate = "<table class='table'><thead><tr></tr></thead><tbody><tr></tr></tbody></table>";
      if (typeof resp === "number") {
        $("#message").addClass("alert-success").text("Successfully added this many triples: "+resp);
      }
      else if (typeof resp === 'object' && resp.length > 0) {
        $("#results").html(tableTemplate);
        var labels = Object.keys(resp[0]),
            $heads = $("#results table thead tr").first(),
            $body = $("#results table tbody");
        labels.forEach(function(label){
          $heads.append($("<th>").text(label));
        });
        resp.forEach(function(row){
          var $rowhtml = $("<tr>");
          labels.forEach(function(label){
            $rowhtml.append($("<td>").text(row[label].value));
          });
          $body.append($rowhtml);
        });
      }
    },

    checkForRecentScrapes : function(){
      //document.getElementById("scrapelist").innerHTML = "";
      $("#scrapelist").html("");
      Scraper.getScrapeList(function(scrapes){
        scrapes.forEach(function(scrape){
          var scrapeDate = new Date(parseInt(scrape.name.match(/-([0-9]+)\./)[1],10)),
              scrapeDateString = scrapeDate.toLocaleString().split(" ").slice(0,5).join(" "),
              loader = $("<p>"),
              loadButton = $("<a class='btn btn-primary btn-mini'>Load</a>").bind("click", function(){
                Scraper.load(scrape);
              }),
              delButton = $("<a class='btn btn-danger btn-mini'>Delete</a>").bind("click",function(){
                scrape.remove(function(){}, function(){});
                Scraper.checkForRecentScrapes();
              }),
              downloadButton = $("<a class='btn btn-mini'>Download</a>").attr('href', scrape.toURL());
          loader.append("Scrape found from ", scrapeDateString, " ", loadButton, " ", downloadButton, " ", delButton)
            .appendTo("#scrapelist");
        });
      });
    }

  };

  TCGA.loadScript("https://raw.github.com/wilkinson/quanah/master/src/quanah.js", function(err){
    if (err) throw err;
    TCGA.registerTab({id : Scraper.name, title: Scraper.nav, content : Scraper.gui});
    Scraper.init();
    TCGA.Scraper = TCGA.Scraper || Scraper;
  });

})(TCGA);

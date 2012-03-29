//
// TCGA Scraper
//
// A TCGA Web Toolbox Module that scrapes the TCGA http/ftp site
// into RDF triples and provides a query runner
//
//

(function(TCGA){
  //Check for TCGA, fail if not found
  if (!TCGA) { throw "TCGA required"; }

  var uuid = function uuid(a){
      //Function from https://gist.github.com/982883 (@jed)
      return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
    };

  // Semaphore from https://gist.github.com/1296828
  var Sync = function(syncCount, callback, preventInstantCallbackExecution) {
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

  var fsErrorCallback = function fsErrorCallback(e) {
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

  function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
  }

  var TCGAScraper = {

    init : function init(){
      var that = this;

      //Initialize the RDF Store
      this.store = new rdfstore.Store(function(store){
        store.registerDefaultProfileNamespaces();
        store.registerDefaultNamespace("tcga", "http://tcga.github.com/#");
        console.log("Store ready");
      });

      //Initialize the File System
      window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
      this.fileSystem = window.requestFileSystem(window.PERSISTENT, 500*1024*1024, function(newFs){
        that.fileSystem = newFs;
        console.log("Filesystem ready");
        that.checkForRecentScrapes();
      }, fsErrorCallback);

      // Remove old databases
      var db = openDatabase('tcga', '1.0', 'Scrapes of the TCGA as text/n3', 500000000);
      var onerror = function(tx, err){
            if (!err.message.match(/no such table/)) console.error(err);
            else db = null;
          },
          onsuccess = function(tx, resp){ console.log("Removed old scrapes table"); db = null;};
      db.transaction(function(tx){
        tx.executeSql("DROP TABLE scrapes", [], onsuccess, onerror);
      });

      // Init the UI
      $("#query").submit(function(e){
        var query = $("#sparql", this).val();
        if(query !== ""){
          try {
            TCGAScraper.store.execute(query, function(succ, resp){
              if(!succ){
                that.postMessage("error", "Unable to execute query: " + query);
              }
              else {
                TCGAScraper.parseResults(resp);
              }
            });
          }
          catch (e){
            that.postMessage("error", "Unable to execute query: " + query);
          }
        }
        return false;
      });
      $("<p>").append($("<a class='btn btn-primary'>Start new Scrape</a>").click((that.scrape).bind(that)))
        .appendTo("#controls");
    },

    store : null,

    fileSystem : null,

    scrapeList : null,

    gui : '<div class="span12"><h1>TCGA SPARQL Interface</h1></div><form class="span6" id="query"><div class="control-group"><div class="controls"><textarea class="span6" id="sparql" rows="10">SELECT * WHERE { ?s ?p ?o . } LIMIT 25</textarea><span class="help-inline"><p>Enter our SPARQL Query and click submit.</p></span></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">Submit Query</button> <button class="btn">Cancel</button></div></form><div id="controls" class="span6"><div id="message"></div><div id="scrapelist"></div></div><div class="span12" id="results"></div>',

    nav : 'SPARQL',

    name : 'tcga-sparql',

    types : {
      9 : "tcga:disease-study",
      10 : "tcga:center-type",
      11 : "tcga:center-domain",
      12 : "tcga:platform",
      13 : "tcga:data-type",
      14 : "tcga:archive",
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

    scrape : function(options){
      var opts = options || {},
          that = this, // Capture context for use in closures
          target = opts.url || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/",
          store = opts.store || this.store,
          parent = opts.parent,
          callback = opts.callback || (!opts.parent && (this.save).bind(that)) || null;

      if (!store) {
        console.error("RDFStore required");
        return;
      }

      if (!opts.url) console.log("Beginning scrape of: ",target);

      if (!that.scraping) that.scraping = true;

      if (!opts.parent) that.startSpinner("a.btn-primary:contains('Start new Scrape')");

      TCGA.get(target, function(error, response){

        if (error) {
          console.error("Failed to get", target);
          return;
        }

        var links = $("a", $(response)),
            link, index, children = [],
            querystring = "@prefix tcga:<http://tcga.github.com/#> .\n";

        links.each(function(index, link){

          var name = $(link).attr('href'),
              id = uuid(),
              url = target + name,
              type = that.types[target.split("/").length];

          // Filter out links beginning with ? or /
          // (i.e. column headers and parent links)
          if(name.match(/^[\?\/]/)) return;

          // Things with extensions are files (e.g. reallylong_name.tiff)
          // TODO Use MIME types to determine files.
          if(name.match(/^.*\.[^\/]+$/)) type = that.types.file;

          // TODO when should this NOT be done (e.g. files)
          if(type !== that.types.file) name = name.slice(0,-1); // Remove the trailing "/"

          querystring += 'tcga:'+id+' tcga:url "'+url+'" ;\n';
          querystring += "tcga:type "+type+" ;\n";
          if(parent){
            querystring += "tcga:parent tcga:"+parent+" ;\n";
          }
          querystring += 'tcga:ftp-name "'+name+'" .\n';

          if (type !== that.types.file && target.split("/").length <= 9){
            children.push({store:store, url:url, parent:id});
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
                  that.scrape(child);
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

    load : function(callback){
      var that = this,
          dirReader, scrapes = [], readEntries;

      if (!that.fileSystem) {
        console.log("Unable to load most recent scrape: filesystem not loaded");
        return;
      }

      that.getScrapeList(function(scrapes){
        var scrape = scrapes[scrapes.length-1], //Get the most recent scrape
            scrapeDate = new Date(parseInt(scrape.name.match(/-([0-9]+)\./)[1],10)),
            scrapeDateString = scrapeDate.toLocaleString().split(" ").slice(0,5).join(" ");
        console.log("Loading scrape from:", scrapeDate);
        scrape.file(function(scrapefile){
          var reader = new FileReader();

          reader.onloadend = function(e){
            that.store.load("text/n3", this.result, function(succ, results){
              if (!succ) {
                that.postMessage("error", ["Failed to load triples from scrape on", scrapeDateString]);
                console.error("Failed to load triples from scrape on", scrapeDate);
                return;
              }
              that.postMessage("success", ["Loaded", results, "triples scraped on", scrapeDateString]);
              console.log("Loaded", results, "triples scraped on", scrapeDate);
            });
          };

          reader.readAsText(scrapefile);
        }, fsErrorCallback);
      });
    },

    getScrapeList : function(callback){
      var that = this,
          dirReader, scrapes = [], readEntries;

      if (!that.fileSystem) {
        console.log("Unable get scrape list: filesystem not loaded");
        return;
      }

      dirReader = that.fileSystem.root.createReader();
      readEntries = function() {
         dirReader.readEntries (function(results) {
          if (!results.length) {
            that.scrapeList = scrapes;
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
      var that = this,
          now = new Date(),
          filename = ["tcgascrape-",now.valueOf(),".nt"].join("");

      if (!that.fileSystem) {
        that.postMessage("error", "Unable to save scrape: filesystem not loaded");
        console.log("Unable to save scrape: filesystem not loaded");
        return;
      }

      that.store.graph(function(succ,graph){
        if (!succ) {
          console.error("Unable to get graph for serialization");
          return;
        }
        that.fileSystem.root.getFile(filename, {create: true, exclusive: false}, function(fileEntry) {
          var url = fileEntry.toURL();
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              that.postMessage("success", ['Saved scrape from', now.toString()]);
              console.log('Saved scrape from', now.toString(), 'to', url);
              that.endSpinner("a.btn-primary:contains('Start new Scrape')");
              that.checkForRecentScrapes();
              if (callback && typeof callback === 'function') callback();
            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
            };

            var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
            bb.append(graph.toNT());
            fileWriter.write(bb.getBlob('text/plain'));

          });
        }, fsErrorCallback);
      });
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
      var that=this;
      $("#scrapelist").empty();
      that.getScrapeList(function(scrapes){
        scrapes.forEach(function(scrape){
          var scrapeDate = new Date(parseInt(scrape.name.match(/-([0-9]+)\./)[1],10)),
              scrapeDateString = scrapeDate.toLocaleString().split(" ").slice(0,5).join(" "),
              loader = $("<p>"),
              loadButton = $("<a class='btn btn-primary btn-mini'>Load</a>").bind("click",(that.load).bind(that)),
              delButton = $("<a class='btn btn-danger btn-mini'>Delete</a>").bind("click",function(){
                scrape.remove();
                that.checkForRecentScrapes();
              }),
              downloadButton = $("<a class='btn btn-mini'>Download</a>").attr('href', scrape.toURL());
          loader.append("Scrape found from ", scrapeDateString, " ", loadButton, " ", downloadButton, " ", delButton)
            .appendTo("#scrapelist");
        });
      });
    }

  };

  TCGA.registerTab(TCGAScraper.name, TCGAScraper.nav, TCGAScraper.gui);
  TCGAScraper.init();
  TCGA.Scraper = TCGA.Scraper || TCGAScraper;

})(TCGA);

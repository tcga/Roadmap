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

  var TCGAScraper = {

    init : function init(){
      this.store = new rdfstore.Store(function(store){
        store.registerDefaultProfileNamespaces();
        store.registerDefaultNamespace("tcga", "http://tcga.github.com/#");
      });
      this.db = openDatabase('tcga', '1.0', 'Scrapes of the TCGA as text/n3', 500000000);
      this.ensureTablePresent();
    },

    store : null,

    db : null,

    gui : '<div class="span12"><h1>TCGA SPARQL Interface</h1></div><form class="span6" id="query"><div class="control-group"><label class="control-label" for="sparql">SPARQL Query</label><div class="controls"><textarea class="span6" id="sparql" rows="10">SELECT * WHERE { ?s ?p ?o . } LIMIT 25</textarea><span class="help-inline"><p>Enter your SPARQL Query and click submit.</p></span></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">Submit Query</button> <button class="btn">Cancel</button></div></form><div id="controls" class="span6"><div id="message"></div></div><div class="span12" id="results"></div>',

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

          if (type !== that.types.file){// && target.split("/").length <= 8){
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
          cb = typeof callback === 'function' ? callback : null;
      that.db.transaction(function(tx){
        tx.executeSql('SELECT * FROM scrapes ORDER BY timestamp DESC', [],
          function(tx, results){
            var today = (new Date()).valueOf(),
                mostRecentScrape = results.rows.item(0),
                dayInMilliseconds = 86400000,
                weekInMilliseconds = 7 * dayInMilliseconds;
            if ( mostRecentScrape.timestamp < today - weekInMilliseconds){
              console.log("Most recent scrape out of date, starting new scrape...");
              that.scrape();
            }
            else{
              that.store.load("text/n3", mostRecentScrape.scrape, function(success, results){
                if (!success) {
                  console.log("Unable to load scrape from",(new Date(mostRecentScrape.timestamp)).toISOString(),
                    ". Starting new scrape...");
                  that.scrape();
                }
                else {
                  console.log("Loaded", results, "triples from scrape on",
                    (new Date(mostRecentScrape.timestamp)).toISOString());
                  if (cb) cb();
                }
              });
            }
          },
          that._onSqlError
        );
      });
    },

    save : function(callback){
      var that = this,
          cb = typeof callback === 'function' ? callback : null,
          today = new Date();
      that.store.graph(function(success, graph){
        if (!success) console.log("Unable to serialize graph. Scrape not saved.");
        else{
          var graphAsNT = graph.toNT();
          that.db.transaction(function(tx){
            tx.executeSql("INSERT INTO scrapes (timestamp, scrape) VALUES (?, ?)", [today.valueOf(), graphAsNT],
              function(tx, results){
                console.log("Saved scrape from", today.toISOString());
              },
              that._onSqlError
            );
          });
        }
      });
    },

    _onSqlError : function(tx, error){
      if (error.code === 5 && error.message.match(/no such table/)){
        return;
      }
      else {
        console.error("Unable to perform SQL transaction", error);
      }
    },

    ensureTablePresent : function(){
      var createTable = function(){
            that.db.transaction(function(tx) {
              tx.executeSql("CREATE TABLE scrapes (timestamp REAL UNIQUE, scrape TEXT)", [],
                  function(tx) { console.log('Table for storing scrapes created'); },
                  function(err) { console.log(err);});
            });
          };
          that = this;
      that.db.transaction(function(tx) {
        tx.executeSql("SELECT timestamp FROM scrapes", [],
            function(tx, results) {console.log("Table exists");},
            function(tx, err) { createTable();}
        );
      });
    },

    recreateTable : function(){
      var onerror = function(tx, err){ console.error(err); },
          that = this,
          db = this.db;
      db.transaction(function(tx){
        tx.executeSql("DROP TABLE scrapes", [], that.ensureTablePresent.bind(that), onerror);
      });
    }

  };

  TCGAScraper.init();
  TCGA.registerTab(TCGAScraper.name, TCGAScraper.nav, TCGAScraper.gui);

  var parseResults = function parseResults(resp){
    var tableTemplate = "<table class='table'><thead><tr></tr></thead><tbody><tr></tr></tbody></table>";
    if (typeof resp === "number") {
      $("#message").addClass("alert").addClass("alert-success").text("Successfully added this many triples: "+resp);
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
  };

  $("#query").submit(function(e){
    var query = $("#sparql", this).val();
    if(query !== ""){
      try {
        TCGAScraper.store.execute(query, function(succ, resp){
          if(!succ) $("#message").addClass("alert").addClass("alert-error").text("Unable to execute query: " + query);
          else {
            parseResults(resp);
          }
        });
      }
      catch (e){
        $("#message").addClass("alert").addClass("alert-error").text("Unable to parse query: " + query);
      }
    }
    return false;
  });
  TCGA.Scraper = TCGA.Scraper || TCGAScraper;
})(TCGA);

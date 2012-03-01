(function(){
  //Check for TCGA, fail if not found
  if (!TCGA) { throw "TCGA required"; }

  var uuid = function uuid(a){
    //Function from https://gist.github.com/982883 (@jed)
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
  };

  var TCGAScraper = {

    init : function init(){
      console.log("Scrape Started");
      this.store = new rdfstore.Store({ persistent:true, name:"tgca-rdf", overwrite:"false"}, function(store){
        store.registerDefaultProfileNamespaces();
        store.registerDefaultNamespace("tcga", "http://tcga/#");
      });
    },

    store : null,

    levels : {
      9 : "tcga:disease-study",
      10 : "tcga:center-type",
      11 : "tcga:center-domain",
      12 : "tcga:platform",
      13 : "tcga:data-type"
    },

    scrape : function(url){
      var target = url || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/",
          store = this.store,
          type = this.levels[target.split("/").length];
      TCGA.get(target, function(error, response){
        if (!error){
          var $links = $("a", $(response)),
              querystring = "";
          $links.each(function(i, link){
            var name = $(link).attr("href"),
                id = uuid();
            if(name.match(/^[\?\/]/)) {
              return;
            }
            name = name.split("/")[0];
            querystring += "tcga:"+id+" tcga:type "+type+" .\n";
            querystring += "tcga:"+id+" tcga:study-abbreviation tcga:"+name.toUpperCase()+" .\n";
          });
          store.execute("INSERT DATA {"+querystring+"}", function(success, results){
            if(!success){
              console.error(results);
            }
          });
        }
      });
    }
  };

  //Load a few modules and bootstrap the application
  TCGA.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", function(error){
    if (!error){
      TCGA.loadScript("https://github.com/antoniogarrote/rdfstore-js/raw/master/dist/browser_persistent/rdf_store_min.js", function(error){
        if(!error){
          TCGAScraper.init();
          TCGA.Scraper = TCGA.Scraper || TCGAScraper;
        }
      });
    }
  });
})();

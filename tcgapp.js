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
      this.store = new rdfstore.Store(function(store){
        store.registerDefaultProfileNamespaces();
        store.registerDefaultNamespace("tcga", "http://tcga/#");
      });
    },

    store : null,

    types : {
      9 : "tcga:disease-study",
      10 : "tcga:center-type",
      11 : "tcga:center-domain",
      12 : "tcga:platform",
      13 : "tcga:data-type",
      14 : "tcga:archive",
      file : "tcga:file"
    },

    scrape : function(url, parentId){
      var TCGARoot = "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/",
          target = url || TCGARoot,
          store = this.store,
          types = this.types;
      TCGA.get(target, function(error, response){
        if (!error){
          var $links = $("a", $(response));
          $links.each(function(i, link){
            var name = $(link).attr("href"),
                id = uuid(),
                url = target + name,
                querystring = "",
                type = types[target.split("/").length];
            if(name.match(/^[\?\/]/)) {
              return;
            }
            if(name.match(/^.*\.[^\/]+$/)){
              type = types.file;
            }
            name = name.split("/")[0];
            querystring += "tcga:"+id+" tcga:url '"+url+"' .\n";
            querystring += "tcga:"+id+" tcga:type "+type+" .\n";
            querystring += "tcga:"+id+" tcga:ftp-name '"+name+"' .\n";
            if(parentId){
              querystring += "tcga:"+id+" tcga:parent tcga:"+parentId+" .\n";
            }
            store.execute("INSERT DATA {"+querystring+"}", function(success, results){
              if(!success){
                console.error(results);
              }
            });
            if (type !== types.file){
              TCGA.Scraper.scrape(url, id);
            }
          });
        }
      });
    }
  };

  //Load a few modules and bootstrap the application
  TCGA.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", function(error){
    if (!error){
      TCGA.loadScript("https://github.com/antoniogarrote/rdfstore-js/raw/master/dist/browser/rdf_store_min.js", function(error){
        if(!error){
          TCGAScraper.init();
          TCGA.Scraper = TCGA.Scraper || TCGAScraper;
        }
      });
    }
  });
})();

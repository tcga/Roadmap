(function(){
  //Check for TCGA, fail if not found
  if (!TCGA) { throw "TCGA required"; }

  var tcgapp = {
    bootstrap : function bootstrap(){
      var container = document.querySelector(".container"),
          oldContents = container.innerHTML;
      container.innerHTML = tcgapp.templates.scaffold;
      container.querySelector("#tcga-toolbox-content").innerHTML = oldContents;
      tcgapp.navigate();
    },
    navigate : function navigate(url){
      var target = url || "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/";
      TCGA.get(target, function(error, response){
        var responseContainer, links;
        if (!error){
          responseContainer = document.createElement("div");
          responseContainer.innerHTML = response;
        }
      });
    }
  };

  tcgapp.templates = {
    scaffold :  ''+
                '<div id="nav" class="row">' +
                '<h1>TCGA Browser</h1>' +
                '</div>' +
                '<div id="content" class="row">' +
                '  <table></table>' +
                '</div>' +
                '<div id="tcga-toolbox-content" class="row">' +
                '</div>'
  };

  //Load a few modules and bootstrap the application
  TCGA.loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js", function(error){
    if (!error){
      tcgapp.bootstrap();
    }
  });
})();

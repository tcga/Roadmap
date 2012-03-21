function errorHandler(e) {
  var msg = '';

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
  };

  console.log('Error: ' + msg);
}

a = $("<a>").attr('download', "triples.n3").text("Download").appendTo("footer")

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

window.requestFileSystem(window.TEMPORARY, 500*1024*1024, function(fs){
  var uriContent;
  TCGA.Scraper.db.transaction(function(tx){
    tx.executeSql("SELECT * FROM scrapes",[],
      function(tx,results){
        var row = results.rows.item(0),
            content = row.scrape;
        uriContent = "data:text/plain;charset=utf-8" + content;
      fs.root.getFile('triples.n3', {create: true}, function(fileEntry) {
          fileEntry.remove(function() {
            console.log('File removed.');
          }, errorHandler);
          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {
              console.log('Write completed.');
              a.attr('href', fileEntry.toURL());

            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
            };

            // Create a new Blob and write it to log.txt.
            var bb = new window.WebKitBlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
            bb.append(content);
            fileWriter.write(bb.getBlob('text/plain'));

          });

        });
      },
      function(tx,err){console.log("Failed:", err);}
    );
  })
});

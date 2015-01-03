TCGAPagesStream = require "../tcgaPagesStream"
TCGALiner       = require "../tcgaLiner"
FakeGetter      = require "./helpers/fakeGetter"
Sink            = require "./helpers/sinkStream"
request         = require "request"

describe "TCGAPagesStream to TCGALiner", ->

    pagesStream = liner = sink = null

    beforeEach ->
        pagesStream = new TCGAPagesStream()
        liner       = new TCGALiner()
        sink        = new Sink()
        spyOn request, "get"
            .andCallFake (new FakeGetter [rootHtml, accHtml]).get
        spyOn liner, "_transform"
        spyOn pagesStream, "push"
        spyOn sink, "write"

    it "pushes all loaded pages", ->
        pagesStream.pipe(liner).pipe(sink)
        expect(pagesStream.push).toHaveBeenCalled()
        expect(sink.write).toHaveBeenCalled()
        #expect(liner._transform).toHaveBeenCalled()


rootHtml = """
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<html>
 <head>
  <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</title>
 </head>
 <body>
<h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</h1>
<pre>      <a href="?C=N;O=D">Name</a>                                           <a href="?C=M;O=A">Last modified</a>      <a href="?C=S;O=A">Size</a>  <hr>      <a href="/tcgafiles/ftp_auth/distro_ftpusers/anonymous/">Parent Directory</a>                                                    -   
      <a href="README_BCR.txt">README_BCR.txt</a>                                 2012-07-27 16:28  846   
      <a href="README_MAF.txt">README_MAF.txt</a>                                 2014-01-09 10:00  437   
      <a href="acc/">acc/</a>                                           2013-12-05 15:42    -   
      <a href="blca/">blca/</a>                                          2012-04-03 19:57    -   
<hr></pre>
</body></html>
"""

accHtml = """
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<html>
 <head>
  <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc</title>
 </head>
 <body>
<h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc</h1>
<pre>      <a href="?C=N;O=D">Name</a>                                                 <a href="?C=M;O=A">Last modified</a>      <a href="?C=S;O=A">Size</a>  <hr>      <a href="/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/">Parent Directory</a>                                                          -   
      <a href="bcr/">bcr/</a>                                                 2013-05-13 15:23    -   
      <a href="cgcc/">cgcc/</a>                                                2014-08-05 12:57    -   
      <a href="gsc/">gsc/</a>                                                 2014-03-03 22:37    -   
<hr></pre>
</body></html>
"""
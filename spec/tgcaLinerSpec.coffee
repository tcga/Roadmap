TCGALiner = require "../tcgaLiner"

describe "TCGA Liner", ->

    it "should be a stream.", ->
        liner = new TCGALiner()
        expect(liner.pipe).toBeDefined()

    describe "_transform method", ->

        liner = null
        beforeEach ->
            liner = new TCGALiner()

        it "pushes an object with the lines within the pre block", ->
            expectedFirstLine = 
                uri: "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc/"
                line: "<a href=\"bcr/\">bcr/</a>                                                 2013-05-13"
            spyOn liner, "push"
            liner._transform acc
            expect(liner.push.calls.length).toBe 3
            expect(liner.push.calls[0].args[0]).toEqual expectedFirstLine

acc = {
  "uri": "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc/",
  "body": "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 3.2 Final//EN\">\n<html>\n <head>\n  <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc</title>\n </head>\n <body>\n<h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc</h1>\n<pre>      <a href=\"?C=N;O=D\">Name</a>                                                 <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/\">Parent Directory</a>                                                          -   \n      <a href=\"bcr/\">bcr/</a>                                                 2013-05-13 15:23    -   \n      <a href=\"cgcc/\">cgcc/</a>                                                2014-08-05 12:57    -   \n      <a href=\"gsc/\">gsc/</a>                                                 2014-03-03 22:37    -   \n<hr></pre>\n</body></html>\n"
}
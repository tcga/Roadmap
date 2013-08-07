# Tests for Liner

Tests for liner

## Imports

    liner = require '../liner'

## Tests

Writing to module.exports, per the [nodeunit examples](https://github.com/caolan/nodeunit)

    module.exports =

The setup function simply contains the source documents to be lined.

        setUp: (cb) ->
            @tumor = "<pre>      <a href=\"?C=N;O=D\">Name</a>                                           <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/\">Parent Directory</a>                                                    -   
                  <a href=\"README_BCR.txt\">README_BCR.txt</a>                                 2012-07-27 16:28  846   
                  <a href=\"README_MAF.txt\">README_MAF.txt</a>                                 2012-07-27 16:29  898   
                  <a href=\"acc/\">acc/</a>                                           2013-07-12 21:35    -   
                  <a href=\"blca/\">blca/</a>                                          2012-04-03 19:57    -   
                  <a href=\"brca/\">brca/</a>                                          2012-06-18 19:19    -   
                  <a href=\"cesc/\">cesc/</a>                                          2012-03-05 18:55    -   
                  <a href=\"cntl/\">cntl/</a>                                          2012-04-27 03:01    -   
                  <a href=\"coad/\">coad/</a>                                          2012-06-18 19:20    -   
                  <a href=\"dlbc/\">dlbc/</a>                                          2012-04-16 12:48    -   
                  <a href=\"esca/\">esca/</a>                                          2013-01-25 22:04    -   
                  <a href=\"gbm/\">gbm/</a>                                           2009-01-29 16:19    -   
                  <a href=\"hnsc/\">hnsc/</a>                                          2012-10-12 09:38    -   
                  <a href=\"kich/\">kich/</a>                                          2013-03-15 08:15    -   
                  <a href=\"kirc/\">kirc/</a>                                          2012-04-05 17:14    -   
                  <a href=\"kirp/\">kirp/</a>                                          2012-12-06 12:51    -   
                  <a href=\"laml/\">laml/</a>                                          2012-06-18 19:20    -   
                  <a href=\"lcml/\">lcml/</a>                                          2013-01-04 03:01    -   
                  <a href=\"lgg/\">lgg/</a>                                           2012-11-30 08:44    -   
                  <a href=\"lihc/\">lihc/</a>                                          2011-05-02 15:14    -   
                  <a href=\"lnnh/\">lnnh/</a>                                          2011-09-02 03:01    -   
                  <a href=\"lost+found/\">lost+found/</a>                                    2012-09-27 13:00    -   
                  <a href=\"luad/\">luad/</a>                                          2012-06-18 18:49    -   
                  <a href=\"lusc/\">lusc/</a>                                          2012-04-03 21:35    -   
                  <a href=\"meso/\">meso/</a>                                          2012-08-22 03:02    -   
                  <a href=\"misc/\">misc/</a>                                          2013-01-04 03:01    -   
                  <a href=\"ov/\">ov/</a>                                            2010-11-16 13:54    -   
                  <a href=\"paad/\">paad/</a>                                          2012-11-30 08:37    -   
                  <a href=\"pcpg/\">pcpg/</a>                                          2013-01-04 03:01    -   
                  <a href=\"prad/\">prad/</a>                                          2012-04-17 15:49    -   
                  <a href=\"read/\">read/</a>                                          2012-06-18 19:21    -   
                  <a href=\"sarc/\">sarc/</a>                                          2012-08-10 00:35    -   
                  <a href=\"skcm/\">skcm/</a>                                          2012-09-24 12:53    -   
                  <a href=\"stad/\">stad/</a>                                          2012-03-06 11:52    -   
                  <a href=\"tgct/\">tgct/</a>                                          2013-06-14 03:02    -   
                  <a href=\"thca/\">thca/</a>                                          2012-10-10 10:41    -   
                  <a href=\"ucec/\">ucec/</a>                                          2012-04-25 19:20    -   
                  <a href=\"ucs/\">ucs/</a>                                           2013-07-03 18:22    -   
                  <a href=\"uvm/\">uvm/</a>                                           2013-05-10 03:02    -   
            <hr></pre>
            "
            cb()

Just a sanity test to ensure everything is kosher.

        sanity: (assert) ->
            assert.equal 1, 1, "One wasn't one"
            assert.done()

Test the line count for the tumor. There should be the correct number of lines.

        lineCount: (assert) ->
            lineCount = liner(@tumor).length
            assert.equal lineCount, 38, "Wrong number of lines"
            assert.done()

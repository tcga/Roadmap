# Tests for Indexer

Indexer is tested by mocking out the interaction
with the TCGA and MongoDB.

    mocks = require './mocks'
    Indexer = require '../indexer'
    hub = require 'node-pubsub'

    hub.subscribe('/docs', mocks.listener.listen)

    module.exports =
        setUp: (done) ->
            @indexer = new Indexer hub
            done()

        tearDown: (done) ->
            mocks.listener.clear()
            done()

        topLevel: (assert) ->
            setup.topLevel()
            @indexer.go (err) ->
                assert.ok mocks.tcga.isDone()
                assert.equal mocks.listener.received(), 4, "Didn't get the right number of messages.."
                assert.done()

        fullDescent: (assert) ->
            setup.fullDescent() # change to fullDescent()
            @indexer.go (err) ->
                assert.ok mocks.tcga.isDone()
                assert.equal mocks.listener.received(), 341, "Didn't get the right number of messages.."
                assert.equal (file.name for file in mocks.listener.messages when file.type is "File").length, 333, "Not the right number of files"
                assert.equal (archive.name for archive in mocks.listener.messages when archive.type is "Archive").length, 3, "Not the right number of archives"
                assert.done()

## Mocks for particular HTTP Calls

Down and the bottom because they are bulky.

    setup =
        topLevel: () ->
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/")
                .reply 200, "<html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                           <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/\">Parent Directory</a>                                                    -   
                          <a href=\"README_BCR.txt\">README_BCR.txt</a>                                 2012-07-27 16:28  846   
                          <a href=\"README_MAF.txt\">README_MAF.txt</a>                                 2012-07-27 16:29  898   
                          <a href=\"acc/\">acc/</a>                                           2013-07-12 21:35    -   
                          <a href=\"blca/\">blca/</a>                                          2012-04-03 19:57    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/acc/")
                .reply 200, "abcdefg"
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/blca/")
                .reply 200

        fullDescent: () ->
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/")
                .reply 200, "<html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                           <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/\">Parent Directory</a>                                                    -   
                          <a href=\"brca/\">brca/</a>                                          2012-04-03 19:57    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                 <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/\">Parent Directory</a>                                                          -   
                          <a href=\"cgcc/\">cgcc/</a>                                                2011-11-18 18:23    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                      <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/\">Parent Directory</a>                                                               -   
                          <a href=\"mdanderson.org/\">mdanderson.org/</a>                                           2011-11-18 18:23    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                           <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/\">Parent Directory</a>                                                                    -   
                          <a href=\"mda_rppa_core/\">mda_rppa_core/</a>                                                 2011-11-18 18:23    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                                          <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/\">Parent Directory</a>                                                                                   -   
                          <a href=\"protein_exp/\">protein_exp/</a>                                                                  2013-02-20 17:16    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                                                        <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/\">Parent Directory</a>                                                                                                 -   
                          <a href=\"mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0.tar.gz\">mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0.tar.gz</a>                                      2011-11-18 18:27  932M  
                          <a href=\"mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0.tar.gz.md5\">mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0.tar.gz.md5</a>                                  2011-11-18 18:27   88   
                          <a href=\"mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0/\">mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0/</a>                                            2011-11-18 18:24    -   
                    <hr></pre>

                    </body></html>
                    "
            mocks.tcga.get("/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0/")
                .reply 200, "
                    <html><head>
                      <title>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0</title>
                     </head>
                     <body>
                    <h1>Index of /tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp/mdanderson.org_BRCA.MDA_RPPA_Core.Level_1.1.0.0</h1>
                    <pre>      <a href=\"?C=N;O=D\">Name</a>                                                                                                    <a href=\"?C=M;O=A\">Last modified</a>      <a href=\"?C=S;O=A\">Size</a>  <hr>      <a href=\"/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/cgcc/mdanderson.org/mda_rppa_core/protein_exp/\">Parent Directory</a>                                                                                                             -   
                          <a href=\"14-3-3_epsilon-M-C_GBL9013486.tif\">14-3-3_epsilon-M-C_GBL9013486.tif</a>                                                                       2011-11-18 18:24  6.4M  
                          <a href=\"14-3-3_epsilon-M-C_GBL9013486.txt\">14-3-3_epsilon-M-C_GBL9013486.txt</a>                                                                       2011-11-18 18:24  836K  
                          <a href=\"4E-BP1-R-V_GBL9013200.tif\">4E-BP1-R-V_GBL9013200.tif</a>                                                                               2011-11-18 18:24  6.6M  
                          <a href=\"4E-BP1-R-V_GBL9013200.txt\">4E-BP1-R-V_GBL9013200.txt</a>                                                                               2011-11-18 18:24  858K  
                          <a href=\"4E-BP1_pS65-R-V_GBL9013201.tif\">4E-BP1_pS65-R-V_GBL9013201.tif</a>                                                                          2011-11-18 18:24  6.4M  
                          <a href=\"4E-BP1_pS65-R-V_GBL9013201.txt\">4E-BP1_pS65-R-V_GBL9013201.txt</a>                                                                          2011-11-18 18:24  844K  
                          <a href=\"4E-BP1_pT170-R-V_GBL9013203.tif\">4E-BP1_pT170-R-V_GBL9013203.tif</a>                                                                         2011-11-18 18:24  6.3M  
                          <a href=\"4E-BP1_pT170-R-V_GBL9013203.txt\">4E-BP1_pT170-R-V_GBL9013203.txt</a>                                                                         2011-11-18 18:24  845K  
                          <a href=\"4E-BP1_pT37-R-V_GBL9013202.tif\">4E-BP1_pT37-R-V_GBL9013202.tif</a>                                                                          2011-11-18 18:24  6.3M  
                          <a href=\"4E-BP1_pT37-R-V_GBL9013202.txt\">4E-BP1_pT37-R-V_GBL9013202.txt</a>                                                                          2011-11-18 18:24  865K  
                          <a href=\"53BP1-R-C_GBL9013204.tif\">53BP1-R-C_GBL9013204.tif</a>                                                                                2011-11-18 18:24  6.1M  
                          <a href=\"53BP1-R-C_GBL9013204.txt\">53BP1-R-C_GBL9013204.txt</a>                                                                                2011-11-18 18:24  871K  
                          <a href=\"A-Raf_pS299-R-NA_GBL9013439.tif\">A-Raf_pS299-R-NA_GBL9013439.tif</a>                                                                         2011-11-18 18:24  6.2M  
                          <a href=\"A-Raf_pS299-R-NA_GBL9013439.txt\">A-Raf_pS299-R-NA_GBL9013439.txt</a>                                                                         2011-11-18 18:24  843K  
                          <a href=\"ACC1-R-C_GBL9013206.tif\">ACC1-R-C_GBL9013206.tif</a>                                                                                 2011-11-18 18:24  6.2M  
                          <a href=\"ACC1-R-C_GBL9013206.txt\">ACC1-R-C_GBL9013206.txt</a>                                                                                 2011-11-18 18:24  866K  
                          <a href=\"ACC_pS79-R-V_GBL9013205.tif\">ACC_pS79-R-V_GBL9013205.tif</a>                                                                             2011-11-18 18:24  6.3M  
                          <a href=\"ACC_pS79-R-V_GBL9013205.txt\">ACC_pS79-R-V_GBL9013205.txt</a>                                                                             2011-11-18 18:24  858K  
                          <a href=\"AIB1-M-V_GBL9013344.tif\">AIB1-M-V_GBL9013344.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"AIB1-M-V_GBL9013344.txt\">AIB1-M-V_GBL9013344.txt</a>                                                                                 2011-11-18 18:24  846K  
                          <a href=\"AMPK_alpha-R-C_GBL9013210.tif\">AMPK_alpha-R-C_GBL9013210.tif</a>                                                                           2011-11-18 18:24  6.4M  
                          <a href=\"AMPK_alpha-R-C_GBL9013210.txt\">AMPK_alpha-R-C_GBL9013210.txt</a>                                                                           2011-11-18 18:24  858K  
                          <a href=\"AMPK_pT172-R-V_GBL9013211.tif\">AMPK_pT172-R-V_GBL9013211.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"AMPK_pT172-R-V_GBL9013211.txt\">AMPK_pT172-R-V_GBL9013211.txt</a>                                                                           2011-11-18 18:24  870K  
                          <a href=\"ANLN-M-NA_GBL9013453.tif\">ANLN-M-NA_GBL9013453.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"ANLN-M-NA_GBL9013453.txt\">ANLN-M-NA_GBL9013453.txt</a>                                                                                2011-11-18 18:24  891K  
                          <a href=\"AR-R-V_GBL9013213.tif\">AR-R-V_GBL9013213.tif</a>                                                                                   2011-11-18 18:24  6.3M  
                          <a href=\"AR-R-V_GBL9013213.txt\">AR-R-V_GBL9013213.txt</a>                                                                                   2011-11-18 18:24  859K  
                          <a href=\"ATM-R-NA_GBL9013214.tif\">ATM-R-NA_GBL9013214.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"ATM-R-NA_GBL9013214.txt\">ATM-R-NA_GBL9013214.txt</a>                                                                                 2011-11-18 18:24  872K  
                          <a href=\"Akt-R-V_GBL9013465.tif\">Akt-R-V_GBL9013465.tif</a>                                                                                  2011-11-18 18:24  5.5M  
                          <a href=\"Akt-R-V_GBL9013465.txt\">Akt-R-V_GBL9013465.txt</a>                                                                                  2011-11-18 18:24  928K  
                          <a href=\"Akt_pS473-R-V_GBL9013208.tif\">Akt_pS473-R-V_GBL9013208.tif</a>                                                                            2011-11-18 18:24  6.4M  
                          <a href=\"Akt_pS473-R-V_GBL9013208.txt\">Akt_pS473-R-V_GBL9013208.txt</a>                                                                            2011-11-18 18:24  834K  
                          <a href=\"Akt_pT308-R-V_GBL9013209.tif\">Akt_pT308-R-V_GBL9013209.tif</a>                                                                            2011-11-18 18:24  6.1M  
                          <a href=\"Akt_pT308-R-V_GBL9013209.txt\">Akt_pT308-R-V_GBL9013209.txt</a>                                                                            2011-11-18 18:24  896K  
                          <a href=\"Annexin_I-R-V_GBL9013410.tif\">Annexin_I-R-V_GBL9013410.tif</a>                                                                            2011-11-18 18:24  6.3M  
                          <a href=\"Annexin_I-R-V_GBL9013410.txt\">Annexin_I-R-V_GBL9013410.txt</a>                                                                            2011-11-18 18:24  953K  
                          <a href=\"B-Raf-M-NA_GBL9013421.tif\">B-Raf-M-NA_GBL9013421.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"B-Raf-M-NA_GBL9013421.txt\">B-Raf-M-NA_GBL9013421.txt</a>                                                                               2011-11-18 18:24  898K  
                          <a href=\"Bak-R-C_GBL9013429.tif\">Bak-R-C_GBL9013429.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"Bak-R-C_GBL9013429.txt\">Bak-R-C_GBL9013429.txt</a>                                                                                  2011-11-18 18:24  866K  
                          <a href=\"Bax-R-V_GBL9013216.tif\">Bax-R-V_GBL9013216.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"Bax-R-V_GBL9013216.txt\">Bax-R-V_GBL9013216.txt</a>                                                                                  2011-11-18 18:24  859K  
                          <a href=\"Bcl-2-M-V_GBL9013345.tif\">Bcl-2-M-V_GBL9013345.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Bcl-2-M-V_GBL9013345.txt\">Bcl-2-M-V_GBL9013345.txt</a>                                                                                2011-11-18 18:24  849K  
                          <a href=\"Bcl-X-R-C_GBL9013218.tif\">Bcl-X-R-C_GBL9013218.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"Bcl-X-R-C_GBL9013218.txt\">Bcl-X-R-C_GBL9013218.txt</a>                                                                                2011-11-18 18:24  846K  
                          <a href=\"Bcl-xL-R-C_GBL9013219.tif\">Bcl-xL-R-C_GBL9013219.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"Bcl-xL-R-C_GBL9013219.txt\">Bcl-xL-R-C_GBL9013219.txt</a>                                                                               2011-11-18 18:24  839K  
                          <a href=\"Beclin-G-V_GBL9013414.tif\">Beclin-G-V_GBL9013414.tif</a>                                                                               2011-11-18 18:24  6.2M  
                          <a href=\"Beclin-G-V_GBL9013414.txt\">Beclin-G-V_GBL9013414.txt</a>                                                                               2011-11-18 18:24  920K  
                          <a href=\"Bid-R-C_GBL9013220.tif\">Bid-R-C_GBL9013220.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"Bid-R-C_GBL9013220.txt\">Bid-R-C_GBL9013220.txt</a>                                                                                  2011-11-18 18:24  844K  
                          <a href=\"Bim-R-V_GBL9013221.tif\">Bim-R-V_GBL9013221.tif</a>                                                                                  2011-11-18 18:24  6.4M  
                          <a href=\"Bim-R-V_GBL9013221.txt\">Bim-R-V_GBL9013221.txt</a>                                                                                  2011-11-18 18:24  849K  
                          <a href=\"C-Raf-R-V_GBL9013299.tif\">C-Raf-R-V_GBL9013299.tif</a>                                                                                2011-11-18 18:24  6.4M  
                          <a href=\"C-Raf-R-V_GBL9013299.txt\">C-Raf-R-V_GBL9013299.txt</a>                                                                                2011-11-18 18:24  849K  
                          <a href=\"C-Raf_pS338-R-C_GBL9013300.tif\">C-Raf_pS338-R-C_GBL9013300.tif</a>                                                                          2011-11-18 18:24  6.3M  
                          <a href=\"C-Raf_pS338-R-C_GBL9013300.txt\">C-Raf_pS338-R-C_GBL9013300.txt</a>                                                                          2011-11-18 18:24  851K  
                          <a href=\"CD31-M-V_GBL9013423.tif\">CD31-M-V_GBL9013423.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"CD31-M-V_GBL9013423.txt\">CD31-M-V_GBL9013423.txt</a>                                                                                 2011-11-18 18:24  855K  
                          <a href=\"CD49b-M-V_GBL9013489.tif\">CD49b-M-V_GBL9013489.tif</a>                                                                                2011-11-18 18:24  6.4M  
                          <a href=\"CD49b-M-V_GBL9013489.txt\">CD49b-M-V_GBL9013489.txt</a>                                                                                2011-11-18 18:24  850K  
                          <a href=\"CDK1-R-V_GBL9013228.tif\">CDK1-R-V_GBL9013228.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"CDK1-R-V_GBL9013228.txt\">CDK1-R-V_GBL9013228.txt</a>                                                                                 2011-11-18 18:24  858K  
                          <a href=\"COX-2-R-C_GBL9013249.tif\">COX-2-R-C_GBL9013249.tif</a>                                                                                2011-11-18 18:24  6.4M  
                          <a href=\"COX-2-R-C_GBL9013249.txt\">COX-2-R-C_GBL9013249.txt</a>                                                                                2011-11-18 18:24  870K  
                          <a href=\"Caspase-7_cleavedD198-R-C_GBL9013224.tif\">Caspase-7_cleavedD198-R-C_GBL9013224.tif</a>                                                                2011-11-18 18:24  6.4M  
                          <a href=\"Caspase-7_cleavedD198-R-C_GBL9013224.txt\">Caspase-7_cleavedD198-R-C_GBL9013224.txt</a>                                                                2011-11-18 18:24  842K  
                          <a href=\"Caspase-8-M-C_GBL9013487.tif\">Caspase-8-M-C_GBL9013487.tif</a>                                                                            2011-11-18 18:24  6.5M  
                          <a href=\"Caspase-8-M-C_GBL9013487.txt\">Caspase-8-M-C_GBL9013487.txt</a>                                                                            2011-11-18 18:24  853K  
                          <a href=\"Caspase-9_cleavedD330-R-C_GBL9013478.tif\">Caspase-9_cleavedD330-R-C_GBL9013478.tif</a>                                                                2011-11-18 18:24  6.2M  
                          <a href=\"Caspase-9_cleavedD330-R-C_GBL9013478.txt\">Caspase-9_cleavedD330-R-C_GBL9013478.txt</a>                                                                2011-11-18 18:24  868K  
                          <a href=\"Caveolin-1-R-V_GBL9013227.tif\">Caveolin-1-R-V_GBL9013227.tif</a>                                                                           2011-11-18 18:24  6.4M  
                          <a href=\"Caveolin-1-R-V_GBL9013227.txt\">Caveolin-1-R-V_GBL9013227.txt</a>                                                                           2011-11-18 18:24  880K  
                          <a href=\"Chk1-R-V_GBL9013431.tif\">Chk1-R-V_GBL9013431.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"Chk1-R-V_GBL9013431.txt\">Chk1-R-V_GBL9013431.txt</a>                                                                                 2011-11-18 18:24  874K  
                          <a href=\"Chk1_pS345-R-C_GBL9013230.tif\">Chk1_pS345-R-C_GBL9013230.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"Chk1_pS345-R-C_GBL9013230.txt\">Chk1_pS345-R-C_GBL9013230.txt</a>                                                                           2011-11-18 18:24  863K  
                          <a href=\"Chk2-M-C_GBL9013347.tif\">Chk2-M-C_GBL9013347.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"Chk2-M-C_GBL9013347.txt\">Chk2-M-C_GBL9013347.txt</a>                                                                                 2011-11-18 18:24  858K  
                          <a href=\"Chk2_pT68-R-C_GBL9013231.tif\">Chk2_pT68-R-C_GBL9013231.tif</a>                                                                            2011-11-18 18:24  6.2M  
                          <a href=\"Chk2_pT68-R-C_GBL9013231.txt\">Chk2_pT68-R-C_GBL9013231.txt</a>                                                                            2011-11-18 18:24  868K  
                          <a href=\"Claudin-7-R-V_GBL9013233.tif\">Claudin-7-R-V_GBL9013233.tif</a>                                                                            2011-11-18 18:24  6.2M  
                          <a href=\"Claudin-7-R-V_GBL9013233.txt\">Claudin-7-R-V_GBL9013233.txt</a>                                                                            2011-11-18 18:24  869K  
                          <a href=\"Collagen_VI-R-V_GBL9013235.tif\">Collagen_VI-R-V_GBL9013235.tif</a>                                                                          2011-11-18 18:24  6.2M  
                          <a href=\"Collagen_VI-R-V_GBL9013235.txt\">Collagen_VI-R-V_GBL9013235.txt</a>                                                                          2011-11-18 18:24  890K  
                          <a href=\"Cyclin_B1-R-V_GBL9013248.tif\">Cyclin_B1-R-V_GBL9013248.tif</a>                                                                            2011-11-18 18:24  6.3M  
                          <a href=\"Cyclin_B1-R-V_GBL9013248.txt\">Cyclin_B1-R-V_GBL9013248.txt</a>                                                                            2011-11-18 18:24  859K  
                          <a href=\"Cyclin_D1-R-V_GBL9013247.tif\">Cyclin_D1-R-V_GBL9013247.tif</a>                                                                            2011-11-18 18:24  6.4M  
                          <a href=\"Cyclin_D1-R-V_GBL9013247.txt\">Cyclin_D1-R-V_GBL9013247.txt</a>                                                                            2011-11-18 18:24  861K  
                          <a href=\"Cyclin_E1-M-V_GBL9013348.tif\">Cyclin_E1-M-V_GBL9013348.tif</a>                                                                            2011-11-18 18:24  6.4M  
                          <a href=\"Cyclin_E1-M-V_GBL9013348.txt\">Cyclin_E1-M-V_GBL9013348.txt</a>                                                                            2011-11-18 18:24  845K  
                          <a href=\"DESCRIPTION.txt\">DESCRIPTION.txt</a>                                                                                         2011-11-18 18:24  2.1K  
                          <a href=\"DJ-1-R-C_GBL9013245.tif\">DJ-1-R-C_GBL9013245.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"DJ-1-R-C_GBL9013245.txt\">DJ-1-R-C_GBL9013245.txt</a>                                                                                 2011-11-18 18:24  871K  
                          <a href=\"Dvl3-R-V_GBL9013457.tif\">Dvl3-R-V_GBL9013457.tif</a>                                                                                 2011-11-18 18:24  5.7M  
                          <a href=\"Dvl3-R-V_GBL9013457.txt\">Dvl3-R-V_GBL9013457.txt</a>                                                                                 2011-11-18 18:24  903K  
                          <a href=\"E-Cadherin-R-V_GBL9013244.tif\">E-Cadherin-R-V_GBL9013244.tif</a>                                                                           2011-11-18 18:24  6.1M  
                          <a href=\"E-Cadherin-R-V_GBL9013244.txt\">E-Cadherin-R-V_GBL9013244.txt</a>                                                                           2011-11-18 18:24  879K  
                          <a href=\"EGFR-R-C_GBL9013241.tif\">EGFR-R-C_GBL9013241.tif</a>                                                                                 2011-11-18 18:24  6.2M  
                          <a href=\"EGFR-R-C_GBL9013241.txt\">EGFR-R-C_GBL9013241.txt</a>                                                                                 2011-11-18 18:24  855K  
                          <a href=\"EGFR_pY1068-R-V_GBL9013480.tif\">EGFR_pY1068-R-V_GBL9013480.tif</a>                                                                          2011-11-18 18:24  6.2M  
                          <a href=\"EGFR_pY1068-R-V_GBL9013480.txt\">EGFR_pY1068-R-V_GBL9013480.txt</a>                                                                          2011-11-18 18:24  891K  
                          <a href=\"EGFR_pY1173-R-C_GBL9013240.tif\">EGFR_pY1173-R-C_GBL9013240.tif</a>                                                                          2011-11-18 18:24  6.3M  
                          <a href=\"EGFR_pY1173-R-C_GBL9013240.txt\">EGFR_pY1173-R-C_GBL9013240.txt</a>                                                                          2011-11-18 18:24  852K  
                          <a href=\"EGFR_pY992-R-V_GBL9013246.tif\">EGFR_pY992-R-V_GBL9013246.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"EGFR_pY992-R-V_GBL9013246.txt\">EGFR_pY992-R-V_GBL9013246.txt</a>                                                                           2011-11-18 18:24  851K  
                          <a href=\"ER-alpha-R-V_GBL9013236.tif\">ER-alpha-R-V_GBL9013236.tif</a>                                                                             2011-11-18 18:24  6.5M  
                          <a href=\"ER-alpha-R-V_GBL9013236.txt\">ER-alpha-R-V_GBL9013236.txt</a>                                                                             2011-11-18 18:24  863K  
                          <a href=\"ER-alpha_pS118-R-V_GBL9013237.tif\">ER-alpha_pS118-R-V_GBL9013237.tif</a>                                                                       2011-11-18 18:24  6.3M  
                          <a href=\"ER-alpha_pS118-R-V_GBL9013237.txt\">ER-alpha_pS118-R-V_GBL9013237.txt</a>                                                                       2011-11-18 18:24  871K  
                          <a href=\"ERCC1-M-C_GBL9013425.tif\">ERCC1-M-C_GBL9013425.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"ERCC1-M-C_GBL9013425.txt\">ERCC1-M-C_GBL9013425.txt</a>                                                                                2011-11-18 18:24  878K  
                          <a href=\"ERK2-R-NA_GBL9013250.tif\">ERK2-R-NA_GBL9013250.tif</a>                                                                                2011-11-18 18:24  6.4M  
                          <a href=\"ERK2-R-NA_GBL9013250.txt\">ERK2-R-NA_GBL9013250.txt</a>                                                                                2011-11-18 18:24  907K  
                          <a href=\"FAK-R-C_GBL9013251.tif\">FAK-R-C_GBL9013251.tif</a>                                                                                  2011-11-18 18:24  6.2M  
                          <a href=\"FAK-R-C_GBL9013251.txt\">FAK-R-C_GBL9013251.txt</a>                                                                                  2011-11-18 18:24  891K  
                          <a href=\"FOXO3a-R-C_GBL9013252.tif\">FOXO3a-R-C_GBL9013252.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"FOXO3a-R-C_GBL9013252.txt\">FOXO3a-R-C_GBL9013252.txt</a>                                                                               2011-11-18 18:24  866K  
                          <a href=\"FOXO3a_pS318_S321-R-C_GBL9013253.tif\">FOXO3a_pS318_S321-R-C_GBL9013253.tif</a>                                                                    2011-11-18 18:24  6.2M  
                          <a href=\"FOXO3a_pS318_S321-R-C_GBL9013253.txt\">FOXO3a_pS318_S321-R-C_GBL9013253.txt</a>                                                                    2011-11-18 18:24  880K  
                          <a href=\"Fibronectin-R-C_GBL9013445.tif\">Fibronectin-R-C_GBL9013445.tif</a>                                                                          2011-11-18 18:24  6.3M  
                          <a href=\"Fibronectin-R-C_GBL9013445.txt\">Fibronectin-R-C_GBL9013445.txt</a>                                                                          2011-11-18 18:24  901K  
                          <a href=\"GAB2-R-V_GBL9013459.tif\">GAB2-R-V_GBL9013459.tif</a>                                                                                 2011-11-18 18:24  5.6M  
                          <a href=\"GAB2-R-V_GBL9013459.txt\">GAB2-R-V_GBL9013459.txt</a>                                                                                 2011-11-18 18:24  928K  
                          <a href=\"GATA3-M-V_GBL9013350.tif\">GATA3-M-V_GBL9013350.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"GATA3-M-V_GBL9013350.txt\">GATA3-M-V_GBL9013350.txt</a>                                                                                2011-11-18 18:24  863K  
                          <a href=\"GSK3-alpha-beta-M-V_GBL9013417.tif\">GSK3-alpha-beta-M-V_GBL9013417.tif</a>                                                                      2011-11-18 18:24  6.3M  
                          <a href=\"GSK3-alpha-beta-M-V_GBL9013417.txt\">GSK3-alpha-beta-M-V_GBL9013417.txt</a>                                                                      2011-11-18 18:24  897K  
                          <a href=\"GSK3-alpha-beta_pS21_S9-R-V_GBL9013254.tif\">GSK3-alpha-beta_pS21_S9-R-V_GBL9013254.tif</a>                                                              2011-11-18 18:24  6.2M  
                          <a href=\"GSK3-alpha-beta_pS21_S9-R-V_GBL9013254.txt\">GSK3-alpha-beta_pS21_S9-R-V_GBL9013254.txt</a>                                                              2011-11-18 18:24  898K  
                          <a href=\"HER2-M-V_GBL9013468.tif\">HER2-M-V_GBL9013468.tif</a>                                                                                 2011-11-18 18:24  6.9M  
                          <a href=\"HER2-M-V_GBL9013468.txt\">HER2-M-V_GBL9013468.txt</a>                                                                                 2011-11-18 18:24  872K  
                          <a href=\"HER2_pY1248-R-V_GBL9013467.tif\">HER2_pY1248-R-V_GBL9013467.tif</a>                                                                          2011-11-18 18:24  6.4M  
                          <a href=\"HER2_pY1248-R-V_GBL9013467.txt\">HER2_pY1248-R-V_GBL9013467.txt</a>                                                                          2011-11-18 18:24  848K  
                          <a href=\"HER3-M-C_GBL9013491.tif\">HER3-M-C_GBL9013491.tif</a>                                                                                 2011-11-18 18:24  6.2M  
                          <a href=\"HER3-M-C_GBL9013491.txt\">HER3-M-C_GBL9013491.txt</a>                                                                                 2011-11-18 18:24  934K  
                          <a href=\"HER3_pY1298-R-V_GBL9013462.tif\">HER3_pY1298-R-V_GBL9013462.tif</a>                                                                          2011-11-18 18:24  5.6M  
                          <a href=\"HER3_pY1298-R-V_GBL9013462.txt\">HER3_pY1298-R-V_GBL9013462.txt</a>                                                                          2011-11-18 18:24  899K  
                          <a href=\"HSP70-R-C_GBL9013257.tif\">HSP70-R-C_GBL9013257.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"HSP70-R-C_GBL9013257.txt\">HSP70-R-C_GBL9013257.txt</a>                                                                                2011-11-18 18:24  870K  
                          <a href=\"IGF-1R-beta-R-C_GBL9013259.tif\">IGF-1R-beta-R-C_GBL9013259.tif</a>                                                                          2011-11-18 18:24  6.4M  
                          <a href=\"IGF-1R-beta-R-C_GBL9013259.txt\">IGF-1R-beta-R-C_GBL9013259.txt</a>                                                                          2011-11-18 18:24  870K  
                          <a href=\"IGFBP2-R-V_GBL9013258.tif\">IGFBP2-R-V_GBL9013258.tif</a>                                                                               2011-11-18 18:24  6.2M  
                          <a href=\"IGFBP2-R-V_GBL9013258.txt\">IGFBP2-R-V_GBL9013258.txt</a>                                                                               2011-11-18 18:24  865K  
                          <a href=\"INPP4B-G-C_GBL9013415.tif\">INPP4B-G-C_GBL9013415.tif</a>                                                                               2011-11-18 18:24  6.2M  
                          <a href=\"INPP4B-G-C_GBL9013415.txt\">INPP4B-G-C_GBL9013415.txt</a>                                                                               2011-11-18 18:24  943K  
                          <a href=\"IRS1-R-V_GBL9013260.tif\">IRS1-R-V_GBL9013260.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"IRS1-R-V_GBL9013260.txt\">IRS1-R-V_GBL9013260.txt</a>                                                                                 2011-11-18 18:24  874K  
                          <a href=\"JNK2-R-C_GBL9013261.tif\">JNK2-R-C_GBL9013261.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"JNK2-R-C_GBL9013261.txt\">JNK2-R-C_GBL9013261.txt</a>                                                                                 2011-11-18 18:24  856K  
                          <a href=\"K-Ras-M-C_GBL9013379.tif\">K-Ras-M-C_GBL9013379.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"K-Ras-M-C_GBL9013379.txt\">K-Ras-M-C_GBL9013379.txt</a>                                                                                2011-11-18 18:24  845K  
                          <a href=\"Ku80-R-C_GBL9013263.tif\">Ku80-R-C_GBL9013263.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"Ku80-R-C_GBL9013263.txt\">Ku80-R-C_GBL9013263.txt</a>                                                                                 2011-11-18 18:24  934K  
                          <a href=\"LBK1-M-NA_GBL9013424.tif\">LBK1-M-NA_GBL9013424.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"LBK1-M-NA_GBL9013424.txt\">LBK1-M-NA_GBL9013424.txt</a>                                                                                2011-11-18 18:24  884K  
                          <a href=\"Lck-R-V_GBL9013483.tif\">Lck-R-V_GBL9013483.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"Lck-R-V_GBL9013483.txt\">Lck-R-V_GBL9013483.txt</a>                                                                                  2011-11-18 18:24  861K  
                          <a href=\"MANIFEST.txt\">MANIFEST.txt</a>                                                                                            2011-11-18 18:24   20K  
                          <a href=\"MAPK_pT202_Y204-R-V_GBL9013265.tif\">MAPK_pT202_Y204-R-V_GBL9013265.tif</a>                                                                      2011-11-18 18:24  6.2M  
                          <a href=\"MAPK_pT202_Y204-R-V_GBL9013265.txt\">MAPK_pT202_Y204-R-V_GBL9013265.txt</a>                                                                      2011-11-18 18:24  877K  
                          <a href=\"MEK1-R-V_GBL9013266.tif\">MEK1-R-V_GBL9013266.tif</a>                                                                                 2011-11-18 18:24  6.2M  
                          <a href=\"MEK1-R-V_GBL9013266.txt\">MEK1-R-V_GBL9013266.txt</a>                                                                                 2011-11-18 18:24  878K  
                          <a href=\"MEK1_pS217_S221-R-V_GBL9013267.tif\">MEK1_pS217_S221-R-V_GBL9013267.tif</a>                                                                      2011-11-18 18:24  6.2M  
                          <a href=\"MEK1_pS217_S221-R-V_GBL9013267.txt\">MEK1_pS217_S221-R-V_GBL9013267.txt</a>                                                                      2011-11-18 18:24  879K  
                          <a href=\"MIG-6-M-V_GBL9013383.tif\">MIG-6-M-V_GBL9013383.tif</a>                                                                                2011-11-18 18:24  6.1M  
                          <a href=\"MIG-6-M-V_GBL9013383.txt\">MIG-6-M-V_GBL9013383.txt</a>                                                                                2011-11-18 18:24  857K  
                          <a href=\"MSH2-M-C_GBL9013419.tif\">MSH2-M-C_GBL9013419.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"MSH2-M-C_GBL9013419.txt\">MSH2-M-C_GBL9013419.txt</a>                                                                                 2011-11-18 18:24  863K  
                          <a href=\"MSH6-R-C_GBL9013269.tif\">MSH6-R-C_GBL9013269.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"MSH6-R-C_GBL9013269.txt\">MSH6-R-C_GBL9013269.txt</a>                                                                                 2011-11-18 18:24  890K  
                          <a href=\"Mre11-R-C_GBL9013268.tif\">Mre11-R-C_GBL9013268.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Mre11-R-C_GBL9013268.txt\">Mre11-R-C_GBL9013268.txt</a>                                                                                2011-11-18 18:24  866K  
                          <a href=\"N-Cadherin-R-V_GBL9013432.tif\">N-Cadherin-R-V_GBL9013432.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"N-Cadherin-R-V_GBL9013432.txt\">N-Cadherin-R-V_GBL9013432.txt</a>                                                                           2011-11-18 18:24  849K  
                          <a href=\"NF-kB-p65_pS536-R-C_GBL9013273.tif\">NF-kB-p65_pS536-R-C_GBL9013273.tif</a>                                                                      2011-11-18 18:24  6.4M  
                          <a href=\"NF-kB-p65_pS536-R-C_GBL9013273.txt\">NF-kB-p65_pS536-R-C_GBL9013273.txt</a>                                                                      2011-11-18 18:24  851K  
                          <a href=\"NF2-R-C_GBL9013272.tif\">NF2-R-C_GBL9013272.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"NF2-R-C_GBL9013272.txt\">NF2-R-C_GBL9013272.txt</a>                                                                                  2011-11-18 18:24  863K  
                          <a href=\"Notch1-R-V_GBL9013274.tif\">Notch1-R-V_GBL9013274.tif</a>                                                                               2011-11-18 18:24  6.4M  
                          <a href=\"Notch1-R-V_GBL9013274.txt\">Notch1-R-V_GBL9013274.txt</a>                                                                               2011-11-18 18:24  831K  
                          <a href=\"Notch3-R-C_GBL9013275.tif\">Notch3-R-C_GBL9013275.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"Notch3-R-C_GBL9013275.txt\">Notch3-R-C_GBL9013275.txt</a>                                                                               2011-11-18 18:24  870K  
                          <a href=\"P-Cadherin-R-C_GBL9013223.tif\">P-Cadherin-R-C_GBL9013223.tif</a>                                                                           2011-11-18 18:24  6.4M  
                          <a href=\"P-Cadherin-R-C_GBL9013223.txt\">P-Cadherin-R-C_GBL9013223.txt</a>                                                                           2011-11-18 18:24  842K  
                          <a href=\"PARP_cleaved-M-C_GBL9013420.tif\">PARP_cleaved-M-C_GBL9013420.tif</a>                                                                         2011-11-18 18:24  6.3M  
                          <a href=\"PARP_cleaved-M-C_GBL9013420.txt\">PARP_cleaved-M-C_GBL9013420.txt</a>                                                                         2011-11-18 18:24  851K  
                          <a href=\"PCNA-M-V_GBL9013360.tif\">PCNA-M-V_GBL9013360.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"PCNA-M-V_GBL9013360.txt\">PCNA-M-V_GBL9013360.txt</a>                                                                                 2011-11-18 18:24  851K  
                          <a href=\"PDK1_pS241-R-V_GBL9013289.tif\">PDK1_pS241-R-V_GBL9013289.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"PDK1_pS241-R-V_GBL9013289.txt\">PDK1_pS241-R-V_GBL9013289.txt</a>                                                                           2011-11-18 18:24  861K  
                          <a href=\"PI3K-p110-alpha-R-C_GBL9013291.tif\">PI3K-p110-alpha-R-C_GBL9013291.tif</a>                                                                      2011-11-18 18:24  6.3M  
                          <a href=\"PI3K-p110-alpha-R-C_GBL9013291.txt\">PI3K-p110-alpha-R-C_GBL9013291.txt</a>                                                                      2011-11-18 18:24  847K  
                          <a href=\"PKC-alpha-M-V_GBL9013374.tif\">PKC-alpha-M-V_GBL9013374.tif</a>                                                                            2011-11-18 18:24  6.3M  
                          <a href=\"PKC-alpha-M-V_GBL9013374.txt\">PKC-alpha-M-V_GBL9013374.txt</a>                                                                            2011-11-18 18:24  881K  
                          <a href=\"PKC-alpha_pS657-R-V_GBL9013293.tif\">PKC-alpha_pS657-R-V_GBL9013293.tif</a>                                                                      2011-11-18 18:24  6.2M  
                          <a href=\"PKC-alpha_pS657-R-V_GBL9013293.txt\">PKC-alpha_pS657-R-V_GBL9013293.txt</a>                                                                      2011-11-18 18:24  861K  
                          <a href=\"PKC-delta_pS664-R-V_GBL9013484.tif\">PKC-delta_pS664-R-V_GBL9013484.tif</a>                                                                      2011-11-18 18:24  6.2M  
                          <a href=\"PKC-delta_pS664-R-V_GBL9013484.txt\">PKC-delta_pS664-R-V_GBL9013484.txt</a>                                                                      2011-11-18 18:24  851K  
                          <a href=\"PR-R-V_GBL9013294.tif\">PR-R-V_GBL9013294.tif</a>                                                                                   2011-11-18 18:24  6.4M  
                          <a href=\"PR-R-V_GBL9013294.txt\">PR-R-V_GBL9013294.txt</a>                                                                                   2011-11-18 18:24  837K  
                          <a href=\"PRAS40_pT246-R-V_GBL9013295.tif\">PRAS40_pT246-R-V_GBL9013295.tif</a>                                                                         2011-11-18 18:24  6.3M  
                          <a href=\"PRAS40_pT246-R-V_GBL9013295.txt\">PRAS40_pT246-R-V_GBL9013295.txt</a>                                                                         2011-11-18 18:24  852K  
                          <a href=\"PRDX1-R-NA_GBL9013449.tif\">PRDX1-R-NA_GBL9013449.tif</a>                                                                               2011-11-18 18:24  6.2M  
                          <a href=\"PRDX1-R-NA_GBL9013449.txt\">PRDX1-R-NA_GBL9013449.txt</a>                                                                               2011-11-18 18:24  849K  
                          <a href=\"PTCH-R-C_GBL9013296.tif\">PTCH-R-C_GBL9013296.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"PTCH-R-C_GBL9013296.txt\">PTCH-R-C_GBL9013296.txt</a>                                                                                 2011-11-18 18:24  875K  
                          <a href=\"PTEN-R-V_GBL9013297.tif\">PTEN-R-V_GBL9013297.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"PTEN-R-V_GBL9013297.txt\">PTEN-R-V_GBL9013297.txt</a>                                                                                 2011-11-18 18:24  861K  
                          <a href=\"Paxillin-R-V_GBL9013288.tif\">Paxillin-R-V_GBL9013288.tif</a>                                                                             2011-11-18 18:24  6.4M  
                          <a href=\"Paxillin-R-V_GBL9013288.txt\">Paxillin-R-V_GBL9013288.txt</a>                                                                             2011-11-18 18:24  860K  
                          <a href=\"Pea-15-R-V_GBL9013290.tif\">Pea-15-R-V_GBL9013290.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"Pea-15-R-V_GBL9013290.txt\">Pea-15-R-V_GBL9013290.txt</a>                                                                               2011-11-18 18:24  866K  
                          <a href=\"RBM3-M-NA_GBL9013452.tif\">RBM3-M-NA_GBL9013452.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"RBM3-M-NA_GBL9013452.txt\">RBM3-M-NA_GBL9013452.txt</a>                                                                                2011-11-18 18:24  879K  
                          <a href=\"README_DCC.txt\">README_DCC.txt</a>                                                                                          2011-11-18 18:24  1.6K  
                          <a href=\"Rab25-R-C_GBL9013298.tif\">Rab25-R-C_GBL9013298.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Rab25-R-C_GBL9013298.txt\">Rab25-R-C_GBL9013298.txt</a>                                                                                2011-11-18 18:24  854K  
                          <a href=\"Rad50-M-C_GBL9013362.tif\">Rad50-M-C_GBL9013362.tif</a>                                                                                2011-11-18 18:24  6.4M  
                          <a href=\"Rad50-M-C_GBL9013362.txt\">Rad50-M-C_GBL9013362.txt</a>                                                                                2011-11-18 18:24  865K  
                          <a href=\"Rad51-M-C_GBL9013385.tif\">Rad51-M-C_GBL9013385.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Rad51-M-C_GBL9013385.txt\">Rad51-M-C_GBL9013385.txt</a>                                                                                2011-11-18 18:24  859K  
                          <a href=\"Rb-M-V_GBL9013387.tif\">Rb-M-V_GBL9013387.tif</a>                                                                                   2011-11-18 18:24  6.3M  
                          <a href=\"Rb-M-V_GBL9013387.txt\">Rb-M-V_GBL9013387.txt</a>                                                                                   2011-11-18 18:24  859K  
                          <a href=\"Rb_pS807_S811-R-V_GBL9013301.tif\">Rb_pS807_S811-R-V_GBL9013301.tif</a>                                                                        2011-11-18 18:24  6.2M  
                          <a href=\"Rb_pS807_S811-R-V_GBL9013301.txt\">Rb_pS807_S811-R-V_GBL9013301.txt</a>                                                                        2011-11-18 18:24  855K  
                          <a href=\"S6-R-NA_GBL9013302.tif\">S6-R-NA_GBL9013302.tif</a>                                                                                  2011-11-18 18:24  6.2M  
                          <a href=\"S6-R-NA_GBL9013302.txt\">S6-R-NA_GBL9013302.txt</a>                                                                                  2011-11-18 18:24  860K  
                          <a href=\"S6_pS235_S236-R-V_GBL9013303.tif\">S6_pS235_S236-R-V_GBL9013303.tif</a>                                                                        2011-11-18 18:24  6.2M  
                          <a href=\"S6_pS235_S236-R-V_GBL9013303.txt\">S6_pS235_S236-R-V_GBL9013303.txt</a>                                                                        2011-11-18 18:24  840K  
                          <a href=\"S6_pS240_S244-R-V_GBL9013411.tif\">S6_pS240_S244-R-V_GBL9013411.tif</a>                                                                        2011-11-18 18:24  6.3M  
                          <a href=\"S6_pS240_S244-R-V_GBL9013411.txt\">S6_pS240_S244-R-V_GBL9013411.txt</a>                                                                        2011-11-18 18:24  906K  
                          <a href=\"SETD2-R-NA_GBL9013256.tif\">SETD2-R-NA_GBL9013256.tif</a>                                                                               2011-11-18 18:24  6.2M  
                          <a href=\"SETD2-R-NA_GBL9013256.txt\">SETD2-R-NA_GBL9013256.txt</a>                                                                               2011-11-18 18:24  850K  
                          <a href=\"STAT3_pY705-R-V_GBL9013308.tif\">STAT3_pY705-R-V_GBL9013308.tif</a>                                                                          2011-11-18 18:24  6.3M  
                          <a href=\"STAT3_pY705-R-V_GBL9013308.txt\">STAT3_pY705-R-V_GBL9013308.txt</a>                                                                          2011-11-18 18:24  848K  
                          <a href=\"STAT5-alpha-R-V_GBL9013309.tif\">STAT5-alpha-R-V_GBL9013309.tif</a>                                                                          2011-11-18 18:24  6.4M  
                          <a href=\"STAT5-alpha-R-V_GBL9013309.txt\">STAT5-alpha-R-V_GBL9013309.txt</a>                                                                          2011-11-18 18:24  863K  
                          <a href=\"Shc_pY317-R-NA_GBL9013304.tif\">Shc_pY317-R-NA_GBL9013304.tif</a>                                                                           2011-11-18 18:24  6.2M  
                          <a href=\"Shc_pY317-R-NA_GBL9013304.txt\">Shc_pY317-R-NA_GBL9013304.txt</a>                                                                           2011-11-18 18:24  825K  
                          <a href=\"Smac-M-V_GBL9013476.tif\">Smac-M-V_GBL9013476.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"Smac-M-V_GBL9013476.txt\">Smac-M-V_GBL9013476.txt</a>                                                                                 2011-11-18 18:24  863K  
                          <a href=\"Smad1-R-V_GBL9013485.tif\">Smad1-R-V_GBL9013485.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Smad1-R-V_GBL9013485.txt\">Smad1-R-V_GBL9013485.txt</a>                                                                                2011-11-18 18:24  872K  
                          <a href=\"Smad3-R-V_GBL9013305.tif\">Smad3-R-V_GBL9013305.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Smad3-R-V_GBL9013305.txt\">Smad3-R-V_GBL9013305.txt</a>                                                                                2011-11-18 18:24  841K  
                          <a href=\"Smad4-M-C_GBL9013389.tif\">Smad4-M-C_GBL9013389.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"Smad4-M-C_GBL9013389.txt\">Smad4-M-C_GBL9013389.txt</a>                                                                                2011-11-18 18:24  852K  
                          <a href=\"Snail-M-C_GBL9013426.tif\">Snail-M-C_GBL9013426.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"Snail-M-C_GBL9013426.txt\">Snail-M-C_GBL9013426.txt</a>                                                                                2011-11-18 18:24  862K  
                          <a href=\"Src-M-V_GBL9013358.tif\">Src-M-V_GBL9013358.tif</a>                                                                                  2011-11-18 18:24  6.2M  
                          <a href=\"Src-M-V_GBL9013358.txt\">Src-M-V_GBL9013358.txt</a>                                                                                  2011-11-18 18:24  857K  
                          <a href=\"Src_pY416-R-C_GBL9013307.tif\">Src_pY416-R-C_GBL9013307.tif</a>                                                                            2011-11-18 18:24  6.2M  
                          <a href=\"Src_pY416-R-C_GBL9013307.txt\">Src_pY416-R-C_GBL9013307.txt</a>                                                                            2011-11-18 18:24  860K  
                          <a href=\"Src_pY527-R-V_GBL9013306.tif\">Src_pY527-R-V_GBL9013306.tif</a>                                                                            2011-11-18 18:24  6.2M  
                          <a href=\"Src_pY527-R-V_GBL9013306.txt\">Src_pY527-R-V_GBL9013306.txt</a>                                                                            2011-11-18 18:24  836K  
                          <a href=\"Stathmin-R-V_GBL9013310.tif\">Stathmin-R-V_GBL9013310.tif</a>                                                                             2011-11-18 18:24  6.2M  
                          <a href=\"Stathmin-R-V_GBL9013310.txt\">Stathmin-R-V_GBL9013310.txt</a>                                                                             2011-11-18 18:24  869K  
                          <a href=\"Syk-M-V_GBL9013477.tif\">Syk-M-V_GBL9013477.tif</a>                                                                                  2011-11-18 18:24  6.5M  
                          <a href=\"Syk-M-V_GBL9013477.txt\">Syk-M-V_GBL9013477.txt</a>                                                                                  2011-11-18 18:24  873K  
                          <a href=\"TAZ_pS89-R-C_GBL9013444.tif\">TAZ_pS89-R-C_GBL9013444.tif</a>                                                                             2011-11-18 18:24  6.3M  
                          <a href=\"TAZ_pS89-R-C_GBL9013444.txt\">TAZ_pS89-R-C_GBL9013444.txt</a>                                                                             2011-11-18 18:24  889K  
                          <a href=\"Tau-M-C_GBL9013349.tif\">Tau-M-C_GBL9013349.tif</a>                                                                                  2011-11-18 18:24  6.4M  
                          <a href=\"Tau-M-C_GBL9013349.txt\">Tau-M-C_GBL9013349.txt</a>                                                                                  2011-11-18 18:24  847K  
                          <a href=\"Transglutaminase-M-V_GBL9013418.tif\">Transglutaminase-M-V_GBL9013418.tif</a>                                                                     2011-11-18 18:24  6.3M  
                          <a href=\"Transglutaminase-M-V_GBL9013418.txt\">Transglutaminase-M-V_GBL9013418.txt</a>                                                                     2011-11-18 18:24  892K  
                          <a href=\"Tuberin-R-C_GBL9013314.tif\">Tuberin-R-C_GBL9013314.tif</a>                                                                              2011-11-18 18:24  6.3M  
                          <a href=\"Tuberin-R-C_GBL9013314.txt\">Tuberin-R-C_GBL9013314.txt</a>                                                                              2011-11-18 18:24  860K  
                          <a href=\"VASP-R-C_GBL9013400.tif\">VASP-R-C_GBL9013400.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"VASP-R-C_GBL9013400.txt\">VASP-R-C_GBL9013400.txt</a>                                                                                 2011-11-18 18:24  917K  
                          <a href=\"VEGFR2-R-C_GBL9013446.tif\">VEGFR2-R-C_GBL9013446.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"VEGFR2-R-C_GBL9013446.txt\">VEGFR2-R-C_GBL9013446.txt</a>                                                                               2011-11-18 18:24  891K  
                          <a href=\"XBP1-G-C_GBL9013416.tif\">XBP1-G-C_GBL9013416.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"XBP1-G-C_GBL9013416.txt\">XBP1-G-C_GBL9013416.txt</a>                                                                                 2011-11-18 18:24  933K  
                          <a href=\"XIAP-R-C_GBL9013317.tif\">XIAP-R-C_GBL9013317.tif</a>                                                                                 2011-11-18 18:24  6.2M  
                          <a href=\"XIAP-R-C_GBL9013317.txt\">XIAP-R-C_GBL9013317.txt</a>                                                                                 2011-11-18 18:24  848K  
                          <a href=\"XRCC1-R-C_GBL9013403.tif\">XRCC1-R-C_GBL9013403.tif</a>                                                                                2011-11-18 18:24  6.5M  
                          <a href=\"XRCC1-R-C_GBL9013403.txt\">XRCC1-R-C_GBL9013403.txt</a>                                                                                2011-11-18 18:24  903K  
                          <a href=\"YAP-R-V_GBL9013441.tif\">YAP-R-V_GBL9013441.tif</a>                                                                                  2011-11-18 18:24  6.4M  
                          <a href=\"YAP-R-V_GBL9013441.txt\">YAP-R-V_GBL9013441.txt</a>                                                                                  2011-11-18 18:24  931K  
                          <a href=\"YAP_pS127-R-C_GBL9013442.tif\">YAP_pS127-R-C_GBL9013442.tif</a>                                                                            2011-11-18 18:24  6.4M  
                          <a href=\"YAP_pS127-R-C_GBL9013442.txt\">YAP_pS127-R-C_GBL9013442.txt</a>                                                                            2011-11-18 18:24  880K  
                          <a href=\"YB-1-R-V_GBL9013448.tif\">YB-1-R-V_GBL9013448.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"YB-1-R-V_GBL9013448.txt\">YB-1-R-V_GBL9013448.txt</a>                                                                                 2011-11-18 18:24  877K  
                          <a href=\"YB-1_pS102-R-V_GBL9013443.tif\">YB-1_pS102-R-V_GBL9013443.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"YB-1_pS102-R-V_GBL9013443.txt\">YB-1_pS102-R-V_GBL9013443.txt</a>                                                                           2011-11-18 18:24  848K  
                          <a href=\"alpha-Catenin-M-V_GBL9013471.tif\">alpha-Catenin-M-V_GBL9013471.tif</a>                                                                        2011-11-18 18:24  6.4M  
                          <a href=\"alpha-Catenin-M-V_GBL9013471.txt\">alpha-Catenin-M-V_GBL9013471.txt</a>                                                                        2011-11-18 18:24  863K  
                          <a href=\"beta-Catenin-R-V_GBL9013217.tif\">beta-Catenin-R-V_GBL9013217.tif</a>                                                                         2011-11-18 18:24  6.2M  
                          <a href=\"beta-Catenin-R-V_GBL9013217.txt\">beta-Catenin-R-V_GBL9013217.txt</a>                                                                         2011-11-18 18:24  881K  
                          <a href=\"c-Jun_pS73-R-C_GBL9013232.tif\">c-Jun_pS73-R-C_GBL9013232.tif</a>                                                                           2011-11-18 18:24  6.3M  
                          <a href=\"c-Jun_pS73-R-C_GBL9013232.txt\">c-Jun_pS73-R-C_GBL9013232.txt</a>                                                                           2011-11-18 18:24  843K  
                          <a href=\"c-Kit-R-V_GBL9013262.tif\">c-Kit-R-V_GBL9013262.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"c-Kit-R-V_GBL9013262.txt\">c-Kit-R-V_GBL9013262.txt</a>                                                                                2011-11-18 18:24  854K  
                          <a href=\"c-Met-M-C_GBL9013381.tif\">c-Met-M-C_GBL9013381.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"c-Met-M-C_GBL9013381.txt\">c-Met-M-C_GBL9013381.txt</a>                                                                                2011-11-18 18:24  873K  
                          <a href=\"c-Met_pY1235-R-C_GBL9013234.tif\">c-Met_pY1235-R-C_GBL9013234.tif</a>                                                                         2011-11-18 18:24  6.2M  
                          <a href=\"c-Met_pY1235-R-C_GBL9013234.txt\">c-Met_pY1235-R-C_GBL9013234.txt</a>                                                                         2011-11-18 18:24  871K  
                          <a href=\"c-Myc-R-C_GBL9013271.tif\">c-Myc-R-C_GBL9013271.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"c-Myc-R-C_GBL9013271.txt\">c-Myc-R-C_GBL9013271.txt</a>                                                                                2011-11-18 18:24  868K  
                          <a href=\"cIAP-R-V_GBL9013479.tif\">cIAP-R-V_GBL9013479.tif</a>                                                                                 2011-11-18 18:24  6.4M  
                          <a href=\"cIAP-R-V_GBL9013479.txt\">cIAP-R-V_GBL9013479.txt</a>                                                                                 2011-11-18 18:24  889K  
                          <a href=\"eEF2-R-V_GBL9013243.tif\">eEF2-R-V_GBL9013243.tif</a>                                                                                 2011-11-18 18:24  6.1M  
                          <a href=\"eEF2-R-V_GBL9013243.txt\">eEF2-R-V_GBL9013243.txt</a>                                                                                 2011-11-18 18:24  839K  
                          <a href=\"eEF2K-R-V_GBL9013242.tif\">eEF2K-R-V_GBL9013242.tif</a>                                                                                2011-11-18 18:24  6.2M  
                          <a href=\"eEF2K-R-V_GBL9013242.txt\">eEF2K-R-V_GBL9013242.txt</a>                                                                                2011-11-18 18:24  852K  
                          <a href=\"eIF4E-R-V_GBL9013238.tif\">eIF4E-R-V_GBL9013238.tif</a>                                                                                2011-11-18 18:24  6.3M  
                          <a href=\"eIF4E-R-V_GBL9013238.txt\">eIF4E-R-V_GBL9013238.txt</a>                                                                                2011-11-18 18:24  862K  
                          <a href=\"mTOR-R-V_GBL9013270.tif\">mTOR-R-V_GBL9013270.tif</a>                                                                                 2011-11-18 18:24  6.3M  
                          <a href=\"mTOR-R-V_GBL9013270.txt\">mTOR-R-V_GBL9013270.txt</a>                                                                                 2011-11-18 18:24  890K  
                          <a href=\"p21-R-C_GBL9013276.tif\">p21-R-C_GBL9013276.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"p21-R-C_GBL9013276.txt\">p21-R-C_GBL9013276.txt</a>                                                                                  2011-11-18 18:24  857K  
                          <a href=\"p27-R-V_GBL9013279.tif\">p27-R-V_GBL9013279.tif</a>                                                                                  2011-11-18 18:24  6.2M  
                          <a href=\"p27-R-V_GBL9013279.txt\">p27-R-V_GBL9013279.txt</a>                                                                                  2011-11-18 18:24  846K  
                          <a href=\"p27_pT157-R-C_GBL9013280.tif\">p27_pT157-R-C_GBL9013280.tif</a>                                                                            2011-11-18 18:24  6.2M  
                          <a href=\"p27_pT157-R-C_GBL9013280.txt\">p27_pT157-R-C_GBL9013280.txt</a>                                                                            2011-11-18 18:24  860K  
                          <a href=\"p27_pT198-R-V_GBL9013278.tif\">p27_pT198-R-V_GBL9013278.tif</a>                                                                            2011-11-18 18:24  6.3M  
                          <a href=\"p27_pT198-R-V_GBL9013278.txt\">p27_pT198-R-V_GBL9013278.txt</a>                                                                            2011-11-18 18:24  843K  
                          <a href=\"p38_MAPK-R-C_GBL9013281.tif\">p38_MAPK-R-C_GBL9013281.tif</a>                                                                             2011-11-18 18:24  6.3M  
                          <a href=\"p38_MAPK-R-C_GBL9013281.txt\">p38_MAPK-R-C_GBL9013281.txt</a>                                                                             2011-11-18 18:24  864K  
                          <a href=\"p38_pT180_Y182-R-V_GBL9013282.tif\">p38_pT180_Y182-R-V_GBL9013282.tif</a>                                                                       2011-11-18 18:24  6.2M  
                          <a href=\"p38_pT180_Y182-R-V_GBL9013282.txt\">p38_pT180_Y182-R-V_GBL9013282.txt</a>                                                                       2011-11-18 18:24  856K  
                          <a href=\"p53-R-V_GBL9013437.tif\">p53-R-V_GBL9013437.tif</a>                                                                                  2011-11-18 18:24  6.3M  
                          <a href=\"p53-R-V_GBL9013437.txt\">p53-R-V_GBL9013437.txt</a>                                                                                  2011-11-18 18:24  855K  
                          <a href=\"p70S6K-R-V_GBL9013284.tif\">p70S6K-R-V_GBL9013284.tif</a>                                                                               2011-11-18 18:24  6.3M  
                          <a href=\"p70S6K-R-V_GBL9013284.txt\">p70S6K-R-V_GBL9013284.txt</a>                                                                               2011-11-18 18:24  869K  
                          <a href=\"p70S6K_pT389-R-V_GBL9013285.tif\">p70S6K_pT389-R-V_GBL9013285.tif</a>                                                                         2011-11-18 18:24  6.4M  
                          <a href=\"p70S6K_pT389-R-V_GBL9013285.txt\">p70S6K_pT389-R-V_GBL9013285.txt</a>                                                                         2011-11-18 18:24  838K  
                          <a href=\"p90RSK_pT359_S363-R-C_GBL9013438.tif\">p90RSK_pT359_S363-R-C_GBL9013438.tif</a>                                                                    2011-11-18 18:24  6.3M  
                          <a href=\"p90RSK_pT359_S363-R-C_GBL9013438.txt\">p90RSK_pT359_S363-R-C_GBL9013438.txt</a>                                                                    2011-11-18 18:24  917K  
                    <hr></pre>

                    </body></html>
                    "

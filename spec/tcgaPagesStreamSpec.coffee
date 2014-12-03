TCGAPagesStream = require "../tcgaPagesStream"

describe "TCGA Pages Stream", ->

	it "should be a stream.", ->
		pagesStream = new TCGAPagesStream()
		expect(pagesStream.pipe).toBeDefined()

	it "accepts options", ->
		options = a: "b", c: 1
		pagesStream = new TCGAPagesStream options
		expect(pagesStream.options).toEqual options

	it "understands a rootURL option.", ->
		options = rootURL: "http://example.com"
		pagesStream = new TCGAPagesStream options
		expect(pagesStream.rootURL).toEqual options.rootURL

	it "has a queue.", ->
		pagesStream = new TCGAPagesStream()
		expect(pagesStream._q).toBeDefined()

	describe "_read method", ->

	    request = require "request"

	    pagesStream = {}
	    options = rootURL: "http://example.com"

	    beforeEach ->
	        pagesStream = new TCGAPagesStream options

	    it "method reads from the rootURL", ->
	        spy = spyOn request, "get"
	            .andCallFake (options, callback) ->
	                callback? null, {request: uri: href: options.uri}, "Body"
	        pagesStream._read()
	        expect(spy).toHaveBeenCalled()
	        expect(spy.mostRecentCall.args[0].uri).toEqual options.rootURL
	        expect(spy.calls.length).toEqual 1

	    it "queues links to subdirectories for reading.", (done) ->
	    	spy = spyOn pagesStream._q, "push"
	    		.andCallThrough()
	    	spyOn request, "get"
	            .andCallFake (options, callback) ->
	                callback? null, {request: uri: href: options.uri}, rootHtml
	        pagesStream._read ->
	        	done()
	        expect(spy).toHaveBeenCalled()
	        #expect(pagesStream._q.length()).toBe 2

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
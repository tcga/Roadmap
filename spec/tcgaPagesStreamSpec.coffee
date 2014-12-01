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

describe "TCGA Pages Stream _read method", ->

    request = require "request"

    pagesStream = {}
    options = rootURL: "http://example.com"

    beforeEach ->
        pagesStream = new TCGAPagesStream options

    it "method reads from the rootURL", ->
        spy = spyOn request, "get"
            .andCallFake (url, options, callback) ->
                callback? null, {}, "Body"
        pagesStream._read()
        expect(spy).toHaveBeenCalled()
        expect(spy.mostRecentCall.args[0]).toEqual options.rootURL
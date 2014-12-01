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
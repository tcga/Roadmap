TCGAPagesStream = require "../tcgaPagesStream"

describe "TCGA Pages Stream", ->

	it "should be a stream.", ->
		pagesStream = new TCGAPagesStream()
		expect(pagesStream.pipe).toBeDefined()
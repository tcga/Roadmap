TCGALiner = require "../tcgaLiner"

describe "TCGA Liner", ->

    it "should be a stream.", ->
        liner = new TCGALiner()
        expect(liner.pipe).toBeDefined()
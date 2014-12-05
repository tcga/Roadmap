stream  = require "stream"
cheerio = require "cheerio"

class TCGALiner extends stream.Transform
    constructor: (@options) ->
        super objectMode: true
    _transform: (page, done) ->
        if @options?.verbose then console.log "Now lining:", page.uri
        $ = cheerio.load page.body
        lines = $("pre").html().match(/<a[^>]+>[^<]+<\/a>\s+[\d-]{10}/g)
        @push {uri: page.uri, line: line} for line in lines
        done?()

module.exports = TCGALiner
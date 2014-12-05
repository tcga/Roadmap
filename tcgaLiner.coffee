stream  = require "stream"

class TCGALiner extends stream.Transform
    constructor: (@options) ->
        super objectMode: true

module.exports = TCGALiner
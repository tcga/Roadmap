stream  = require "stream"

class Sink extends stream.Writable
    constructor: (@options) ->
        super objectMode: true
    write: (obj, done) ->
        done?()
    end: (obj, done) ->
        done?()

module.exports = Sink
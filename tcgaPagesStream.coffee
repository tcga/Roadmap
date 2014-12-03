stream  = require "stream"
util    = require "util"
request = require "request"
async   = require "async"
cheerio = require "cheerio"

class TCGAPagesStore extends stream.Readable
    constructor: (@options) ->
        super objectMode: true
        @rootURL = @options?.rootURL
        @_initializeQueue()

    _read: (done) ->
        @_q.resume()
        done?()

    _initializeQueue: ->
        worker = (uri, done) =>
            request.get uri: @rootURL, (err, resp, body) =>
                $     = cheerio.load body
                uri   = resp.request.uri.href
                links = $('pre a')
                    .slice 4
                    .filter (i, el) -> $(el).attr("href").slice(-1) is "/"
                    .map (i,el) -> "#{uri}/#{$(el).attr("href")}"
                    .get()
                @_q.push links if links.length > 0
                # @_q.pause() unless @push({uri: uri, body: body})
                done?()
        @_q = async.queue worker
        @_q.pause()
        if @rootURL then @_q.push(@rootURL)

module.exports = TCGAPagesStore
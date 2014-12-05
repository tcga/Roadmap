stream  = require "stream"
request = require "request"
async   = require "async"
cheerio = require "cheerio"

class TCGAPagesStore extends stream.Readable
    constructor: (@options) ->
        super objectMode: true
        @rootURL = @options?.rootURL or "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/"
        @_initializeQueue()

    _read: (size, done) ->
        @_q.resume()
        done?()

    _initializeQueue: ->
        worker = (uri, done) =>
            if @options.verbose then console.log "Now loading:", uri
            request.get uri: uri, (err, resp, body) =>
                @_queueLinks uri, body
                output = uri: uri, body: body
                if @options.stringMode then output = JSON.stringify output, null, 2
                @_q.pause() unless @push output
                done?()
        @_q = async.queue worker
        @_q.drain = => @push null #Signal EOF when the queue is drained.
        @_q.pause()
        if @rootURL then @_q.push(@rootURL)

    _getLinks: (uri, body) ->
        $     = cheerio.load body
        links = $('pre a')
            .slice 4
            .filter (i, el) -> $(el).attr("href").slice(-1) is "/"
            .map (i,el) -> "#{uri}#{$(el).attr("href")}"
            .get()

    _queueLinks: (uri, body) ->
        links = @_getLinks uri, body
        if links.length > 0
            if @options.once then links = links.slice 0,1
            if not @options.depthFirst then @_q.push links else @_q.unshift links

module.exports = TCGAPagesStore
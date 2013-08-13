# Indexer

Indexer indexes the TCGA's Open Access Repository into MongoDB

## Libraries

    liner = require './liner'
    docer = require './docer'
    async = require 'async'
    request = require 'request'
    (require 'source-map-support').install()

## The Action

    module.exports = class Indexer
        constructor: (@hub, @root) ->
            @root = @root or "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/"
            @queue = async.queue (parentDoc, cb) =>
                request parentDoc.url, (err, resp, body) =>
                    lines = liner body
                    for line in lines
                        do (line) =>
                            doc = docer(parentDoc.url, line)
                            @hub.publish '/docs', [doc] # Node pubsub requires this to be an array
                            @queue.push doc if (doc.url.slice -1) is "/"
                    cb()


        go: (callback) ->
            @queue.drain = callback
            @queue.push
                url: @root

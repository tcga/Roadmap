# Indexer

Indexer indexes the TCGA's Open Access Repository into MongoDB

## Options (as environment variables)

    ROOTURL = process.env.ROOTURL or "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/"
    #MONGOURL = process.env.MONGOURL

## Libraries

    liner = require './liner'
    docer = require './docer'
    async = require 'async'
    request = require 'request'
    hub = require 'node-pubsub'
    writer = require './writer'
    (require 'source-map-support').install()
    #MongoClient = (require 'mongodb').MongoClient

    require './test/mocks' if process.env.TESTING
    console.log "Testing" if process.env.TESTING

## The Action

    indexqueue = async.queue (parentDoc, cb) ->
        request parentDoc.url, (err, resp, body) ->
            console.log body
            lines = liner body
            for line in lines
                do (line) ->
                    doc = docer(parentDoc.url, line)
                    hub.publish '/docs', [doc]
                    #indexqueue.push doc if (doc.url.slice -1) is "/"
            cb()

    hub.subscribe '/docs', writer.listen

    indexqueue.push
        url: ROOTURL

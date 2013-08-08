# Writer

Writer is a sink for the objects generated that just writes them to a file.

    fs = require 'fs'

    filename = process.cwd() + "/out/" + Date.now() + ".json"
    stream = fs.createWriteStream filename

    module.exports =

        listen: (msg, cb) ->
            stream.write (JSON.stringify msg,null,2), cb

        close: (cb) ->
            stream.end cb

        open: (cb) ->
            filename = process.cwd() + "/out/" + Date.now() + ".json"
            stream = fs.createWriteStream filename
            cb?()

        filename: filename

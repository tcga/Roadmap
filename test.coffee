TCGAPagesStream = require "./tcgaPagesStream"
TCGALiner       = require "./tcgaLiner"
fs              = require "fs"
stream          = require "stream"

class StringifyStream extends stream.Transform
    constructor: ->
        super()
        @_readableState.objectMode = false
        @_writableState.objectMode = true
    _transform: (obj, enc, done) ->
        @push JSON.stringify obj, null, 2
        done?()

out = fs.createWriteStream "output.txt"
tcgaPagesStream = new TCGAPagesStream
    rootURL: "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/"
    depthFirst: true
    verbose: true
    once: true
tcgaLiner = new TCGALiner verbose: true

#tcgaPagesStream.pipe(process.stdout)
tcgaPagesStream.pipe(tcgaLiner).pipe(new StringifyStream()).pipe(out)
#tcgaPagesStream.pipe(new StringifyStream()).pipe(out)
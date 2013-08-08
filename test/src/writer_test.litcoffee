# Writer Tests

    writer = require "../writer"
    fs = require 'fs'

    module.exports =

        tearDown: (cb) ->
            writer.close fs.unlink writer.filename, cb

        writeone: (assert) ->
            msg =
                url: "https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/brca/"
                type: "DiseaseStudy"
                name: "brca"
                lastModified: "2012-06-18"
            writer.listen msg
            fs.readFile writer.filename, (err, data) ->
                assert.equal err, null
                assert.deepEqual (JSON.parse data), msg
                assert.done()

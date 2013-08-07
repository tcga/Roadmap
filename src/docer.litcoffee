# Docer

Docer converts a line into a doc.

## Type Hash

The type hash contains the `tcga:type` of objects based on the length of their url.split

    types =
        10 : "DiseaseStudy",
        diseaseStudy : "DiseaseStudy",
        11 : "CenterType",
        12 : "CenterDomain",
        13 : "Platform",
        14 : "DataType",
        15 : "Archive",
        archive : "Archive",
        16 : "File",
        file : "File"

    module.exports = (url, line) ->
        tokens = url.split "/"
        type = if (url.slice -1) is "/" then types[tokens.length] else types.file
        name = if type isnt types.file then tokens[tokens.length-2] else tokens[tokens.length-1]
        doc =
            url: url
            type: type
            name: name
            lastModified: line.slice -10
        if type is types.file
            doc.diseaseStudy = tokens[8]
            doc.centerType = tokens[9]
            doc.centerDomain = tokens[10]
            doc.platform = tokens[11]
            doc.dataType = tokens[12]
            doc.archive = tokens[13]
        doc

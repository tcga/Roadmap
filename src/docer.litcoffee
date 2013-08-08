# Docer

Docer converts a line into a doc.

## Type Hash

The type hash contains the `tcga:type` of objects based on the length of their url.split

    types =
        9 : "DiseaseStudy",
        diseaseStudy : "DiseaseStudy",
        10 : "CenterType",
        11 : "CenterDomain",
        12 : "Platform",
        13 : "DataType",
        14 : "Archive",
        archive : "Archive",
        15 : "File",
        file : "File"

## Utility Functions

    typer = (tokens, href) ->
        type = types[tokens.length]
        if href.match /^.*\.[^\/]+$/ # things with extensions are files
            type = types.file
        if href.match /\.tar\.gz($|\.md5$)/ # .tar.gz and .tar.gz.md5 files are archives
            type = types.archive
        type

    namer = (href) ->
        name = if (href.slice -1) is "/" then href.slice 0,-1 else href

    urler = (parentUrl, name, type) ->
        url = parentUrl + name
        # Append a trailing / to directories
        unless type is types.file or name.match /\.tar\.gz($|\.md5$)/
            url = url + "/"
        url

    addFileAssociations = (doc, tokens) ->
        doc.diseaseStudy = tokens[8]
        doc.centerType = tokens[9]
        doc.centerDomain = tokens[10]
        doc.platform = tokens[11]
        doc.dataType = tokens[12]
        doc.archive = tokens[13]


## Docer function

    module.exports = (parentUrl, line) ->
        tokens = parentUrl.split "/"
        href = (line.match /href="(.*)"/)[1]
        type = typer tokens, href
        name = namer href
        url = urler parentUrl, name, type
        doc =
            url: url
            type: type
            name: name
            lastModified: line.slice -10
        addFileAssociations doc, tokens if type is types.file
        doc ? {}

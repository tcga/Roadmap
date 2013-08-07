# Liner

Liner extracts the lines from TCGA Open Access HTTP Repository pages.

    module.exports = (body) ->
        start = (body.indexOf "<pre>", 0) + 5
        end = body.indexOf "</pre>", 0
        pre = body.slice start, end
        lines = pre.match /<a[^>]+>[^<]+<\/a>\s+[\d-]{10}/g

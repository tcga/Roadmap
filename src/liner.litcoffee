# Liner

Liner extracts the lines from TCGA Open Access HTTP Repository pages. It returns either the list of lines within the first `<pre>` tags, or an empty array if these tags are not found.

    module.exports = (body) ->
        if body
            start = (body.indexOf "<pre>", 0) + 5
            end = body.indexOf "</pre>", 0
            pre = body.slice start, end
            lines = (pre.match /<a[^>]+>[^<]+<\/a>\s+[\d-]{10}/g) or []
        else
            lines = []

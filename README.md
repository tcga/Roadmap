# TCGA Roadmap

## TCGAPagesStream

`TCGAPagesStream` is a readable stream that traverses the [TCGA Open Access HTTP directory tree][tcga], streaming out the contents of these pages for later parsing.

```coffeescript
tcgaPagesStream = new TCGAPagesStream()
tcgaPagesStream.pipe(...)
```

`TCGAPagesStream`'s are object streams, with the read objects of the form:

```json
{
    "uri": "http://..."         // Page URI
    "body": "<html>...</html>"  // Page content (HTTP response body)
}
```

### Options

**Required**

* `rootURL` - URL to begin scraping at. Default `https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/`

**Optional**

* `depthFirst` - perform a depth-first traversal of the directory tree.
* `once` - only traverse the tree to the first leaf.
* `verbose` - console.log's each URL as it's being processed.

[tcga]: https://tcga-data.nci.nih.gov/tcgafiles/ftp_auth/distro_ftpusers/anonymous/tumor/

# Collection of Mocks for inclusion in child processes.

To mock the input and output of the indexer, two libraries are required:

* [nock](https://github.com/flatiron/nock) provides HTTP mocking (e.g. the TCGA)
* A listender for [node-pubsub](https://npmjs.org/package/node-pubsub) provides the hub object used for the output of the indexer

Accordingly, we require them here.

    nock = require 'nock'

## HTTP Domain Mocks

This defines the HTTP domains that nock will intercept. Nock will intercept all
calls to this domain, and expects us to provide a handler for each call our
tests will make.

    tcga = nock 'https://tcga-data.nci.nih.gov'

## Test Listener

This listener simply collects the messages it receives and allows them to be retrieved.

    class Listener
        constructor: () ->
            @messages = []

        listen: (message) =>
            @messages.push message

        received: () ->
            @messages.length

        clear: () ->
            @messages = []

## Export the Mocks

    module.exports =
        tcga: tcga
        listener: new Listener()

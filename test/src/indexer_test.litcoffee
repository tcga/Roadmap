# Tests for Indexer

Indexer is tested by mocking out the interaction
with the TCGA and MongoDB.

    fork = (require 'child_process').fork
    exec = (require 'child_process').exec
    tcga = (require './mocks').tcga

    exports.initial = (assert) ->
        exec 'node indexer.js',
            env:
                TESTING: true
            (err, stdout, stderr) ->
                console.log arguments
                assert.ok tcga.isDone()
                assert.done()

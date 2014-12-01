stream = require "stream"
util = require "util"
request = require "request"

class TCGAPagesStore extends stream.Readable
	constructor: (@options) ->
		super objectMode: true
		@rootURL = @options?.rootURL

	_read: ->
		request.get @rootURL

module.exports = TCGAPagesStore
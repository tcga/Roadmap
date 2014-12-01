stream = require "stream"
util = require "util"

class TCGAPagesStore extends stream.Readable
	constructor: (@options) ->
		@rootURL = @options?.rootURL

module.exports = TCGAPagesStore
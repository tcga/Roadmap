class FakeGetter
    constructor: (@responses) ->
        @count = 0
    get: (options, callback) => # fat arrow prevents rebinding
        response = @responses[@count++] or "Body"
        callback? null, {request: uri: href: options.uri}, response

module.exports = FakeGetter
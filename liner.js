(function() {
  module.exports = function(body) {
    var end, lines, pre, start;
    start = (body.indexOf("<pre>", 0)) + 5;
    end = body.indexOf("</pre>", 0);
    pre = body.slice(start, end);
    return lines = pre.match(/<a[^>]+>[^<]+<\/a>\s+[\d-]{10}/g);
  };

}).call(this);

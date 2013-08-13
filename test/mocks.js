(function() {
  var Listener, nock, tcga,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  nock = require('nock');

  tcga = nock('https://tcga-data.nci.nih.gov');

  Listener = (function() {
    function Listener() {
      this.listen = __bind(this.listen, this);
      this.messages = [];
    }

    Listener.prototype.listen = function(message) {
      return this.messages.push(message);
    };

    Listener.prototype.received = function() {
      return this.messages.length;
    };

    Listener.prototype.clear = function() {
      return this.messages = [];
    };

    return Listener;

  })();

  module.exports = {
    tcga: tcga,
    listener: new Listener()
  };

}).call(this);

/*
//@ sourceMappingURL=mocks.js.map
*/
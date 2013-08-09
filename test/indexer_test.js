(function() {
  var exec, fork, tcga;

  fork = (require('child_process')).fork;

  exec = (require('child_process')).exec;

  tcga = (require('./mocks')).tcga;

  exports.initial = function(assert) {
    return exec('node indexer.js', {
      env: {
        TESTING: true
      }
    }, function(err, stdout, stderr) {
      console.log(arguments);
      assert.ok(tcga.isDone());
      return assert.done();
    });
  };

}).call(this);

/*
//@ sourceMappingURL=indexer_test.js.map
*/
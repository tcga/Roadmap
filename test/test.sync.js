'use strict';
/*jshint node:true globalstrict:true*/
/*global describe:false it:false beforeEach:false */

var expect, Sync;

expect = require('expect.js');
Sync = require ('../sync');

describe("Sync", function () {

  it("should call callback after count is decremented to 0", function (done) {
    var sync, count, i;
    count = 5;
    sync = new Sync(count, done);
    for ( i = count; i > 0; i-- ) {
      sync.decrement();
    }
  });

  it("should allow increments and decrements", function (done) {
    var sync, count, i;
    count = 5;
    sync = new Sync(count, done);
    sync.increment();
    for ( i = count+1; i > 0; i-- ) {
      sync.decrement();
    }
  });

});

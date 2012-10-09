'use strict';
/*jshint node:true globalstrict:true*/

var Sync;

// Semaphore from https://gist.github.com/1296828
Sync = function Sync(syncCount, callback, preventInstantCallbackExecution) {
	this.syncCount = syncCount;
	this.callback = callback;
	if(preventInstantCallbackExecution === false && this.syncCount === 0) {
		this.executeCallback();
	}
};

Sync.prototype.decrement = function() {
	--this.syncCount;
	if(this.syncCount === 0) {
		this.executeCallback();
	}
};

Sync.prototype.increment = function() {
	++this.syncCount;
};

Sync.prototype.executeCallback = function() {
	if (typeof this.callback === "function") this.callback();
};

module.exports = Sync;
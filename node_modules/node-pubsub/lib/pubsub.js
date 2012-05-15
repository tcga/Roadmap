/**
	 *	node-pubsub. Pub/Sub system for Loosely Coupled logic.
	 *	Based on Peter Higgins' port from Dojo to jQuery
	 *	https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js
	 *
	 *	Re-adapted from vanilla Javascript to node.
	 * 
	 * Originally written by Peter Higgin's adapted to vanilla JavaScript by Couto (https://raw.github.com/phiggins42/bloody-jquery-plugins/55e41df9bf08f42378bb08b93efcb28555b61aeb/pubsub.js).
	 * Adapted to node.js by Stephan Wallentin
	 *
	 *
	 *	@class pubsub
	 */

var pubsub = exports = module.exports = (function (){
	var cache = {},
		/**
		 *	[pubsub].publish
		 *	e.g.: [pubsub].publish("/Article/added", [article], this);
		 *
		 *	@class pubsub
		 *	@method publish
		 *	@param topic {String}
		 *	@param args	{Array}
		 *	@param scope {Object} Optional
		 */
		publish = function (topic, args, scope) {
			if (cache[topic]) {
				var thisTopic = cache[topic],
					i = thisTopic.length - 1;

				for (i; i >= 0; i -= 1) {
					thisTopic[i].apply( scope || this, args || []);
				}
			}
		},
		/**
		 *	[pubsub].subscribe
		 *	e.g.: [pubsub].subscribe("/Article/added", Articles.validate)
		 *
		 *	@class pubusub
		 *	@method subscribe
		 *	@param topic {String}
		 *	@param callback {Function}
		 *	@return Event handler {Array}
		 */
		subscribe = function (topic, callback) {
			if (!cache[topic]) {
				cache[topic] = [];
			}
			cache[topic].push(callback);
			return [topic, callback];
		},
		/**
		 *	Events.unsubscribe
		 *	e.g.: var handle = [pubsub].subscribe("/Article/added", Articles.validate);
		 *		[pubsub].unsubscribe(handle);
		 *
		 *	@class Events
		 *	@method unsubscribe
		 *	@param handle {Array}
		 *	@param completly {Boolean}
		 *	@return {type description }
		 */
		unsubscribe = function (handle, completly) {
			var t = handle[0],
				i = cache[t].length - 1;

			if (cache[t]) {
				for (i; i >= 0; i -= 1) {
					if (cache[t][i] === handle[1]) {
						cache[t].splice(cache[t][i], 1);
						if(completly){ delete cache[t]; }
					}
				}
			}
		};

	return {
		publish: publish,
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}());
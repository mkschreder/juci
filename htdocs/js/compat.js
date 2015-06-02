//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

// Browser compatibility code

/*
if (!Date.prototype.toLocaleFormat) {
	(function() {
		Date.prototype.toLocaleFormat = function(formatString) {
			return this.format(formatString);
		};
	}());
}*/

if(!Object.assign){
	Object.assign = function (target, source) {
		function ToObject(val) {
			if (val == null) {
				throw new TypeError('Object.assign cannot be called with null or undefined');
			}

			return Object(val);
		}

		var from;
		var keys;
		var to = ToObject(target);

		for (var s = 1; s < arguments.length; s++) {
			from = arguments[s];
			keys = Object.keys(Object(from));

			for (var i = 0; i < keys.length; i++) {
				to[keys[i]] = from[keys[i]];
			}
		}

		return to;
	};
}

if (!Array.prototype.find) {
	Array.prototype.find = function(predicate) {
		if (this == null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	};
}

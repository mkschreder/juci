/*
 * najax
 * https://github.com/alanclarke/najax
 *
 * Copyright (c) 2012-2015 Alan Clarke
 * Licensed under the MIT license.
 */

var https   = require('https'),
http        = require('http'),
querystring = require('querystring'),
url         = require('url'),
$           = require('jquery-deferred'),
_           = require('underscore'),
najax       = module.exports = request,
default_settings = {
	method: 'POST',
	rejectUnauthorized: true,
	processData: true,
	data: '',
	contentType: 'application/x-www-form-urlencoded',
	headers: {}
};


/* set default settings */
module.exports.defaults = function(opts) {
	return _.extend(default_settings, opts);
};

function _parseOptions(options, a, b){
	var opts = _.extend({}, default_settings);
	if (_.isString(options)) { opts.url = options; }
	else { _.extend(opts, options); }
	_.each([a, b], function(fn) {
		if (_.isFunction(fn)) { opts.success = fn; }
	});
	if (!_.isFunction(a)) { _.extend(opts, a); }
	return opts;
}

/* auto rest interface go! */
_.each('get post put delete'.split(' '),function(method){
	najax[method] = module.exports[method] = function(options, a, b) {
		var opts = _parseOptions(options, a, b);
		opts.method  = method.toUpperCase()
		return najax(opts);
	};
});

/* main function definition */
function request(options, a, b) {
//OPTIONS
	/*
		method overloading, can use:
		-function(url, opts, callback) or
		-function(url, callback)
		-function(opts)
	*/

	console.log("NAJAX"); 
	if (_.isString(options) || _.isFunction(a)) {
		return request(_parseOptions(options, a, b));
	}

	var dfd = new $.Deferred(),
		o = _.extend({}, default_settings, options),
		l = url.parse(o.url),
		ssl = l.protocol.indexOf('https') === 0,
		data = '';

	//DATA
	// Per jquery docs / source: encoding is only done
	// if processData is true (defaults to true)
	// and the data is not already a string
	// https://github.com/jquery/jquery/blob/master/src/ajax.js#L518
	if (o.data && o.processData && o.method === 'GET') {
		o.data = querystring.stringify(o.data)
	} else if (o.data && o.processData && typeof o.data !== 'string' && o.method !== 'GET') {
		switch (o.contentType) {
			case 'application/json': o.data = JSON.stringify(o.data); break;
			case 'application/x-www-form-urlencoded': o.data = querystring.stringify(o.data); break;
			default: o.data = o.data.toString();
		}
	}

	/* if get, use querystring method for data */
	if (o.data) {
		if (o.method === 'GET') {
			if (l.search) {
				l.search += '&' + o.data;
			} else {
				l.search = '?' + o.data;
			}
		} else {
			/* set data content type */
			/*o.headers = _.extend({
				'Content-Type': o.contentType + ';charset=utf-8',
				'Content-Length': Buffer.byteLength(o.data)
			}, o.headers);*/
		}
	}

	options = {
		host: l.hostname,
		path: l.pathname + (l.search || ''),
		method: o.method,
		port: Number(l.port) || (ssl ? 443 : 80),
		headers: o.headers,
		rejectUnauthorized: o.rejectUnauthorized
	};

//AUTHENTICATION
	/* add authentication to http request */
	if (l.auth) {
		options.auth = l.auth;
	} else if (o.username && o.password) {
		options.auth = o.username + ':' + o.password;
	} else if (o.auth){
		options.auth = o.auth;
	}

	_.extend(options, _.pick(o, ['auth', 'agent']));

	/* for debugging, method to get options and return */
	if(o.getopts){
		var getopts =  [ssl, options, o.data||false, o.success||false, o.error||false];
		return getopts;
	}

//REQUEST
	function notImplemented(name) {
		return function() {
			console.error('najax: method jqXHR."' + name + '" not implemented');
			console.trace();
		};
	}

	var jqXHR = {
		readyState: 0,
		status: 0,
		statusText: 'error', // one of: "success", "notmodified", "error", "timeout", "abort", or "parsererror"
		setRequestHeader: notImplemented('setRequestHeader'),
		getAllResponseHeaders: notImplemented('getAllResponseHeaders'),
		statusCode: notImplemented('statusCode'),
		abort: notImplemented('abort')
	};

	function errorHandler(e) {
		// Set data for the fake xhr object
		jqXHR.responseText = e.stack;

		if (_.isFunction(o.error)) {
			o.error(jqXHR, 'error', e);
		}
		// jqXHR, statusText, error
		dfd.reject(jqXHR, 'error', e);
	}

	var req = (ssl ? https : http).request(options, function(res) {
		// Allow getting Response Headers from the XMLHTTPRequest object
		dfd.getResponseHeader = jqXHR.getResponseHeader = function(header) {
			return res.headers[header.toLowerCase()];
		};
		res.on('data', function(d) {
				data += d;
		});
		res.on('end', function() {
			jqXHR.responseText = data;
			if (o.dataType === 'json') {
				//replace control characters
				try {
					data = JSON.parse(data.replace(/[\cA-\cZ]/gi,''));
				} catch(e) {
					return errorHandler(e);
				}
			}

			var statusCode = res.statusCode,
				statusText = 'success';

			if (statusCode === 204 || options.method === 'HEAD') {
				statusText = 'nocontent';
			} else if (statusCode === 304) {
				statusText = 'notmodified';
			}

			// Determine if successful
			// (per https://github.com/jquery/jquery/blob/master/src/ajax.js#L679)
			var isSuccess = statusCode >= 200 && statusCode < 300 || statusCode === 304;
			// Set readyState
			jqXHR.readyState = statusCode > 0 ? 4 : 0;
			jqXHR.status = statusCode;

			if (isSuccess) {
				// Set data for the fake xhr object
				jqXHR.statusText = statusText;

				if (_.isFunction(o.success)) {
					o.success(data, statusText, jqXHR);
				}
				// success, statusText, jqXHR
				dfd.resolve(data, statusText, jqXHR);
			} else {
				// jqXHR, statusText, error
				// When an HTTP error occurs, errorThrown receives the textual portion of the
				// HTTP status, such as "Not Found" or "Internal Server Error."
				statusText = 'error';
				if (_.isFunction(o.error)) {
					o.error(jqXHR, statusText, http.STATUS_CODES[statusCode]);
				}
				dfd.reject(jqXHR, statusText, http.STATUS_CODES[statusCode]);
			}
		});
	});


//ERROR
	req.on('error', errorHandler);

//SEND DATA
	if (o.method !== 'GET' && o.data) {
		req.write(o.data , 'utf-8');
	}
	req.end();

//DEFERRED
	dfd.success = dfd.done;
	dfd.error = dfd.fail;
	return dfd;
}

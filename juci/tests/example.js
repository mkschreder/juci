//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
#!javascript
var assert = require("assert"); 
var JSON = require("JSON"); 
//global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest; 
global.$ = global.jQuery = require("jquery-deferred"); 
global.$.ajax = require("najax"); 
var async = require("async"); 
require("../htdocs/lib/js/jquery-jsonrpc"); 
//global.request = require("../htdocs/lib/js/request").request; 
require("../htdocs/js/rpc"); 
require("../htdocs/js/uci"); 
var $rpc = global.UBUS; 
var $uci = global.UCI; 

var username; 
var password; 

for(var i = 0; i < process.argv.length; i++){
	switch(process.argv[i]){
		case "--pass": password = process.argv[++i]; break; 
		case "--user": username = process.argv[++i]; break; 
	}; 
}

if(!username || !password){
	console.error("Please specify -u <rpcuser> and -p <rpcpassword> arguments!"); 
	process.exit(); 
}

function init(){
	var deferred = $.Deferred(); 
	async.series([
		function(next){
			$rpc.$init({host: "http://192.168.1.4"}).done(function(){
				console.log("Initialized rpc: "+Object.keys($rpc)); 
				next(); 
			}); 
		}, 
		function(next){
			$rpc.$login({username: username, password: password}).done(function(){
				next(); 
			}); 
		}, 
		function(next){
			$uci.$init().done(function(){
				console.log("Initialized uci: "+Object.keys($uci)); 
				next(); 
			}); 
		}
	], function(){
		deferred.resolve(); 
	}); 
	return deferred.promise(); 
}

exports.test = function(){
	console.log("test"); 
}

describe("test", function(){
	it("should pass", function(done){
		init().done(function(){
			assert.equal(0, 0); 
			done(); 
		}); 
	}); 
}); 

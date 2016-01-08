global.assert = require("assert"); 
global.JSON = require("JSON"); 
global.WebSocket = require("ws"); 
global.async = require("async"); 
global.$ = global.jQuery = require("jquery-deferred"); 
global.$.ajax = require("./najax"); 
global.async = require("async"); 
global.watch = require("watchjs").watch; 
global.expect = require("expect.js"); 
require("../juci/src/lib/js/jquery-jsonrpc"); 
require("../juci/src/js/localStorage"); 
require("../juci/src/js/rpc"); 
require("../juci/src/js/uci"); 
require("../juci/src/js/rpc2"); 
var $rpc = global.$rpc = global.UBUS; 
var $uci = global.$uci = global.UCI; 
Object.prototype.assign = require("object-assign"); 

global.annotate = function annotate(fn) {
  var $inject,
      fnText,
      argDecl,
      last;
	
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	
  if (typeof fn == 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      fnText = fn.toString().replace(STRIP_COMMENTS, '');
      argDecl = fnText.match(FN_ARGS);
      argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
        arg.replace(FN_ARG, function(all, underscore, name){
          $inject.push(name);
        });
      });
      fn.$inject = $inject;
    }
  } else if (isArray(fn)) {
    last = fn.length - 1;
    assertArgFn(fn[last], 'fn')
    $inject = fn.slice(0, last);
  } else {
    assertArgFn(fn, 'fn', true);
  }
  return $inject;
}

function JUCIMock(){
	var _controllers = {}; 
	var self = this; 
	self.app = {
		directive: function(name, fn){
			console.log("JUCI.app.directive("+name+")"); 
			return self.app; 
		}, 
		controller: function(name, fn){
			console.log("JUCI.app.controller("+name+")"); 
			_controllers[name] = fn; 
			return self.app; 
		}, 
		config: function(){}
	}
	self.redirect = function(url){
		console.log("JUCIMock redirect: "+url); 
	}
	function LocalStorageMock(){
		var _items = {}; 
		this.getItem = function(name){
			return _items[name]; 
		}
		this.setItem = function(name, value){
			_items[name] = value; 
		}
	}
	function MockWindow(){
		var _location = ""; 
		this.location = {
			set href(value){
				console.log("window.location.href="+value); 
				_location = value; 
			}, 
			get href(){
				return _location; 
			}
		}
	}
	global.window = new MockWindow(); 
	function MockLanguages(){
		var _currentLanguage; 
		this.getLanguages = function(){
			return ["se", "en"]; 
		}, 
		this.setLanguage = function(short_code){
			_currentLanguage = short_code; 
		}
	}
	var mocks = {
		"$window": global.window, 
		"$state": { }, 
		"$session": global.UBUS.$session, 
		"$localStorage": new LocalStorageMock(), 
		"$rpc": global.UBUS, 
		"$uci": global.UCI, 
		"gettext": function(str) { return str; }, 
		"$tr": function(str) { return str; },
		"$languages": new MockLanguages()
	}; 
	global.controller = function(name, scope){
		if(_controllers[name] !== undefined){
			var ctrl = _controllers[name]; 
			scope.$apply = function(){
				console.log("$scope.apply"); 
			}
			scope.$watch = function(name, fn){
				global.watch(this, name, function(){
					fn(this[name]);
				}); 
			} 
			var args = annotate(ctrl).map(function(x){
				switch(x){
					case "$scope": 
						return scope; 
					default: 
						if(x in mocks) return mocks[x]; 
						else if(x in global) return global[x]; 
						else{
							console.error("Missing mock for "+x); 
							return undefined; 
						}
				}
			}); 
			ctrl.apply(ctrl, args); 
		}
		else throw new Error("Controller "+name+" was not found!"); 
	}
}

global.JUCI = new JUCIMock(); 

var PARAMS = {
	host: "localhost", 
	username: "",  
	password: ""
};  

for(var i = 0; i < process.argv.length; i++){
	switch(process.argv[i]){
		case "--pass": PARAMS.password = process.argv[++i]; break; 
		case "--user": PARAMS.username = process.argv[++i]; break; 
		case "--host": PARAMS.host = process.argv[++i]; break; 
	}; 
} 
/*
if(!PARAMS.username || !PARAMS.password ){
	console.error("Please specify --host <host> --user <rpcuser> and --pass <rpcpassword> arguments!"); 
	process.exit(); 
}
*/
global.PARAMS = PARAMS; 

function init(){
	var deferred = $.Deferred(); 
	async.series([
		function(next){
			console.log("Trying to connect to RPC host '"+PARAMS.host+"'..."); 

			$rpc.$init({host: "http://"+PARAMS.host}).done(function(){
				//console.log("Initialized rpc: "+Object.keys($rpc)); 
				next(); 
			}).fail(function(){
				throw new Error("Could not connect to rpc host!"); 
			}); 
		}, 
		function(next){
			$rpc.$login({username: PARAMS.username, password: PARAMS.password}).done(function(){
				next(); 
			}).fail(function(){
				throw new Error("Could not login over RPC using specified username and password!"); 
			}); 
		}, 
		function(next){
			$uci.$init().done(function(){
				//console.log("Initialized uci: "+Object.keys($uci)); 
				next(); 
			}); 
		}
	], function(){
		deferred.resolve(); 
	}); 
	return deferred.promise(); 
}
/*
before(function(done){
	init().done(function(){
		done(); 
	}); 
}); 
*/
exports.$rpc2 = $rpc2; 
exports.$uci = $uci; 
exports.$init = init; 
exports.$rpc = $rpc; 
exports.app = {
	config: function(func){
		//func(); 
	}
}

/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

(function(scope){
	var RPC_HOST = ""; //(($config.rpc.host)?$config.rpc.host:"")
	var RPC_DEFAULT_SESSION_ID = "00000000000000000000000000000000"; 
	var RPC_SESSION_ID = scope.localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
	var RPC_CACHE = {}; 
	
	var gettext = function(text){ return text; }; 
	
	var default_calls = [
		"session.access", 
		"session.login", 
		"local.features", 
		"local.set_rpc_host"
	]; 

	var connect = null; 

	function rpc_request(type, namespace, method, data){
		var sid = ""; 
		
		// check if the request has been made only recently with same parameters
		var key = namespace+method+JSON.stringify(data); 
		if(!RPC_CACHE[key]){
			RPC_CACHE[key] = {}; 
		}
		//if(RPC_CACHE[key].time && ((new Date()).getTime() - RPC_CACHE[key].time.getTime()) < 3000){
		// if this request with same parameters is already in progress then just return the existing promise 
		if(RPC_CACHE[key].deferred && RPC_CACHE[key].deferred.state() == "pending"){
			return RPC_CACHE[key].deferred.promise(); 
		} else {
			RPC_CACHE[key].deferred = $.Deferred(); 
		} 

		// remove completed requests from cache
		var retain = {}; 
		Object.keys(RPC_CACHE).map(function(k){
			if(RPC_CACHE[k].deferred && RPC_CACHE[k].deferred.state() == "pending"){
				retain[k] = RPC_CACHE[k]; 
			}
		});
		RPC_CACHE = retain; 
		
		data.ubus_rpc_session = RPC_SESSION_ID; 
		if(!connect) connect = $rpc2.$connect("ws://localhost:1234");
		connect.done(function(){
			if(type == "call"){
				$rpc2.$call(namespace, method, data).done(function(ret){
					var def = RPC_CACHE[key].deferred; 
					if(ret[0] && (ret[0].code != undefined || ret[0].error)){
						console.log("FAIL request: "+type+", object="+namespace+", method="+method+", data="+JSON.stringify(data)+", resp="+JSON.stringify(ret)); 
						def.reject(ret[0] || {}); 
					}
					else {
						console.log("request: "+type+", object="+namespace+", method="+method+", data="+JSON.stringify(data)+", resp="+JSON.stringify(ret)); 
						def.resolve(ret[0]); 
					}
				}); 
			} else if(type == "list"){
				$rpc2.$list().done(function(ret){
					RPC_CACHE[key].deferred.resolve(ret[0] || {}); 
				}); 
			}
		}); 
/*
		// setup default rpcs
		$.jsonRPC.withOptions({
			namespace: "", 
			endPoint: RPC_HOST+"/ubus"
		}, function(){	 
			//var sid = "00000000000000000000000000000000"; 
			//if($rootScope.sid) sid = $rootScope.sid; 
			//data.ubus_rpc_session = sid;  
			this.request(type, {
				params: [ RPC_SESSION_ID, namespace, method, data],
				success: function(result){
					if(result.result instanceof Array && result.result[0] != 0){ // || result.result[1] == undefined) {
						function _errstr(error){
							switch(error){
								case 0: return gettext("OK"); 
								case 1: return gettext("Invalid command"); 
								case 2: return gettext("Invalid parameters"); 
								case 3: return gettext("Method not found"); 
								case 4: return gettext("Object not found"); 
								case 5: return gettext("No data"); 
								case 6: return gettext("Access denied"); 
								case 7: return gettext("Timed out"); 
								case 8: return gettext("Not supported"); 
								case 9: return gettext("Unknown error"); 
								case 10: return gettext("Connection failed"); 
								default: return gettext("RPC error #")+result.result[0]+": "+result.result[1]; 
							}
						}
						console.log("RPC succeeded ("+namespace+"."+method+"), but returned error: "+JSON.stringify(result)+": "+_errstr(result.result[0]));
						RPC_CACHE[key].deferred.reject(_errstr(result.result[0])); 
						return; 
					}

					//console.log("SID: "+sid + " :: "+ JSON.stringify(result)); 
					RPC_CACHE[key].time = new Date();
					// valid rpc response is either [code,{result}] or just {result}
					// we handle both! (if code == 0 it means success. We already check for errors above) 
					if(result.result instanceof Array){	
						RPC_CACHE[key].data = result.result[1];
						RPC_CACHE[key].deferred.resolve(result.result[1]);
					} else {
						RPC_CACHE[key].data = result.result; 
						RPC_CACHE[key].deferred.resolve(result.result); 
					}
				}, 
				error: function(result){
					console.error("RPC error ("+namespace+"."+method+"): "+JSON.stringify(result));
					if(result && result.error){
						RPC_CACHE[key].deferred.reject(result.error);  
						//$rootScope.$broadcast("error", result.error.message); 
					}
				}
			})
		});
		*/
		return RPC_CACHE[key].deferred.promise(); 
	}
	
	var rpc = {
		$sid: function(sid){
			if(sid) RPC_SESSION_ID = sid; 
			else return RPC_SESSION_ID; 
		}, 
		$isLoggedIn: function(){
			return RPC_SESSION_ID !== RPC_DEFAULT_SESSION_ID; 
		}, 
		$authenticate: function(){
			var self = this; 
			var deferred  = $.Deferred(); 
			
			if(!self.session){
				setTimeout(function(){ deferred.reject(); }, 0); 
				return deferred.promise(); 
			}
			
			// this has to be done in order to prevent wrong results when user opens login page in another tab, 
			// then logs in in a new tab and the old tab is still using the old sid so it will log the user out 
			// of the new tab as well. We therefore need to take sid from the local storage so we always have latest sid!
			var stored_sid = scope.localStorage.getItem("sid"); 
			if(stored_sid !== RPC_DEFAULT_SESSION_ID) RPC_SESSION_ID = stored_sid; 

			self.session.access({
				//"ubus_rpc_session": RPC_SESSION_ID,
				"scope": "ubus" 
			}).done(function(result){
        		if(!("username" in (result.data||{}))) {
					// username must be returned in the response. If it is not returned then rpcd is of wrong version. 
					//alert(gettext("You have been logged out due to inactivity")); 
					RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; // reset sid to 000..
					scope.localStorage.setItem("sid", RPC_SESSION_ID); 
					deferred.reject(); 
				} else {
					self.$session = result; 
					if(!("data" in self.$session)) self.$session.data = {}; 
					//console.log("Session: Loggedin! "); 
					deferred.resolve(result); 
				}  
			}).fail(function err(result){
				RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; 
				console.error("Session access call failed: you will be logged out!"); 
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}, 
		$login: function(opts){
			var self = this; 
			var deferred  = $.Deferred(); 
			
			if(!self.session) {
				setTimeout(function(){ deferred.reject(); }, 0);  
				return deferred.promise(); 
			}

			self.session.login({
				"username": opts.username, 
				"password": opts.password
			}).done(function(result){
				RPC_SESSION_ID = result.ubus_rpc_session;
				scope.localStorage.setItem("sid", RPC_SESSION_ID); 
				self.$session = result; 
				//JUCI.localStorage.setItem("sid", self.sid); 
				//if(result && result.acls && result.acls.ubus) setupUbusRPC(result.acls.ubus); 
				deferred.resolve(self.sid); 
			}).fail(function(result){
				deferred.reject(result); 
			}); 
			return deferred.promise(); 
		},
		$logout: function(){
			var deferred = $.Deferred(); 
			var self = this; 

			if(!self.session) {
				setTimeout(function(){ deferred.reject(); }, 0);  
				return deferred.promise(); ; 
			}

			self.session.destroy().done(function(){
				RPC_SESSION_ID = RPC_DEFAULT_SESSION_ID; // reset sid to 000..
				scope.localStorage.setItem("sid", RPC_SESSION_ID); 
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		},
		$register: function(object, method){
			// console.log("registering: "+object+", method: "+method); 
			if(!object || !method) return; 
			var self = this; 
			function _find(path, method, obj){
				if(!obj.hasOwnProperty(path[0])){
					obj[path[0]] = {}; 
				}
				if(!path.length) {
					(function(object, method){
						// create the rpc method
						obj[method] = function(data){
							if(!data) data = { }; 
							return rpc_request("call", object, method, data); 
						}
					})(object, method); 
				} else {
					var child = path[0]; 
					path.shift(); 
					_find(path, method, obj[child]); 
				}
			}
			// support new slash paths /foo/bar..
			var npath = object; 
			if(object.startsWith("/")) npath = object.substring(1); 
			_find(npath.split(/[\.\/]/), method, self); 
		}, 
		$list: function(){
			return rpc_request("list", "*", "", {}); 
		},
		$isConnected: function(){
			// we do a simple list request. If it fails then we assume we do not have a proper connection to the router
			var self = this; 
			var deferred = $.Deferred(); 
			rpc_request("list", "*", "", {}).done(function(result){
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}, 
		$init: function(host){
			var self = this; 
			if(host) {
				if(host.host) RPC_HOST = host.host;
			} 
			console.log("Init UBUS -> "+RPC_HOST); 
			var deferred = $.Deferred(); 
			default_calls.map(function(x){ self.$register(x); }); 
			// request list of all methods and construct rpc object containing all of the methods in javascript. 
			rpc_request("list", "*", "", {}).done(function(result){
				//alert(JSON.stringify(result)); 
				Object.keys(result).map(function(obj){
					Object.keys(result[obj]).map(function(method){
						self.$register(obj, method); 
					}); 
				}); 
				deferred.resolve(); 
			}).fail(function(){
				deferred.reject(); 
			}); 
			return deferred.promise(); 
		}
	}; 
	
	scope.UBUS = scope.$rpc = rpc; 
	
})(typeof exports === 'undefined'? this : global); 


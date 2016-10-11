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
	var RPC_DEFAULT_SESSION_ID = "00000000000000000000000000000000"; 
	var gettext = function(text){ return text; }; 
	var _session_data = {}; 

	function RevoRPC(){
		this.requests = {}; 
		this.events = {}; 
		this.seq = 1; 
		this.sid = RPC_DEFAULT_SESSION_ID; 
		this.conn_promise = null; 
		Object.defineProperty(this, "$session", { get: function(){ return _session_data; } }); 
	}

	RevoRPC.prototype.$sid = function(){
		return localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
	}

	RevoRPC.prototype.onDisconnected = function(){
		this.connected = false; 
		this.conn_promise = null; 
		_session_data = {}; 
		//scope.localStorage.setItem("rpc_url", undefined); 
	}
	
	RevoRPC.prototype.$reset = function(){
		// reset the stored rpc url
		localStorage.setItem("rpc_url", window.location.host || ""); //"ws://"+window.location.host+"/websocket/"); 
	}

	// Connects to the rpc server. Resolves if connection has been established and fails otherwise. 
	RevoRPC.prototype.$connect = function(host){
		var self = this; 
		var def = this.conn_promise = $.Deferred(); 
		var _host = host || localStorage.getItem("rpc_url") || window.location.host;  
		var address = "ws://"+_host+"/websocket/"; 
		scope.localStorage.setItem("rpc_url", _host); 
		var socket = null; 
		try {
			socket = this.socket = new WebSocket(address); 	
		} catch(e){
			console.log("Failed to initialize websocket using address "+address); 
			setTimeout(function(){ def.reject(); }, 0); 
			return def.promise(); 
		}
		console.log("connecting to rpc server at ("+address+")"); 
		socket.onopen = function(){
			console.log("RPC connection established!"); 
			self.connected = true; 
			def.resolve(); 
		} 
		socket.onerror = function(){
			self.onDisconnected(); 
			console.error("connection failed!"); 
			def.reject();
		}
		socket.onclose = function(){
			console.error("connection closed!"); 
			self.onDisconnected(); 
		}
		socket.onmessage = function(e){
			// resolve requests 
			var data = e.data; 
			var msg = null; 
			try { msg = JSON.parse(data); } catch(e) { 
				console.error("RPC: could not parse message: "+e+": "+data); 
				return; 
			} 
			if(!msg.jsonrpc || msg.jsonrpc != "2.0") return; 
			// a result message with a matching request
			if(msg.id && msg.result != undefined && self.requests[msg.id]){
				var req = self.requests[msg.id]; 
				clearTimeout(req.timeout); 
				//console.log("RPC response "+req.method+" "+JSON.stringify(req.params)+" ("+((new Date()).getTime() - req.time)+"ms): "); //+JSON.stringify(msg.result)); 
				req.deferred.resolve(msg.result); 
			} 
			// an error message for corresponding request
			else if(msg.id && msg.error != undefined && self.requests[msg.id]){
				var req = self.requests[msg.id]; 
				clearTimeout(req.timeout); 
				self.requests[msg.id].deferred.reject(msg.error); 
			} 
			// an event message without id but with method and params
			else if(!msg.id && msg.method && msg.params && self.events[msg.method]){
				self.events[msg.method].map(function(f){
					f({
						type: msg.method, 
						data: msg.params
					}); 
				}); 
			}

		} 
		return def.promise(); 
	}

    RevoRPC.prototype.$logout = function(){
		var sid = scope.localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
		var def = $.Deferred(); 
		this.$request("logout", [sid]).done(function(){
			$juci.loggedin = false; 
			def.resolve(); 
		}).fail(function(){ def.reject(); });  
		return def.promise(); 
    }

    RevoRPC.prototype.$login = function(username, password){
		// allow object as input!
		// TODO: change input to object everywhere once we are stable
		if(username && username.username != undefined){
			password = username.password; 
			username = username.username; 
		}
        var self = this;                
        var def = $.Deferred();         
        self.$request("challenge").done(function(resp){
            console.log("login: got challenge: "+JSON.stringify(resp)); 
            var sha = new jsSHA("SHA-1", "TEXT");    
            var pwhash = new jsSHA("SHA-1", "TEXT"); 
            pwhash.update(password);    
            sha.update(resp.token);     
            sha.update(pwhash.getHash("HEX"));       
            self.$request("login", [username, sha.getHash("HEX")]).done(function(resp){
                console.log("login: "+JSON.stringify(resp)); 
                if(resp.success) {
					self.loggedin = true; 
					scope.localStorage.setItem("sid", resp.success); 
					def.resolve(resp.success); 
				}
				if(resp.error) def.reject(); 
            }).fail(function(){         
                def.reject();           
            }); 
        }).fail(function(){             
            def.reject();               
        }); 
        return def.promise();           
    }

    RevoRPC.prototype.$request = function(method, params){
        var self = this; 
		// prevent trying to send while websocket is connecting
		if(!self.connected) {
			var def = $.Deferred(); 
			def.reject(); 
			return def.promise(); 
		}
		self.seq++; 
		var req = self.requests[self.seq] = {    
			id: self.seq,
			time: (new Date()).getTime(),
			timeout: setTimeout(function(){
				self.requests[req.id] = undefined; 
				console.error("request timed out! ("+method+", "+JSON.stringify(params)+")"); 
				req.deferred.reject(); 
			}, 20000),
			method: method, 
			params: params, 
			deferred: $.Deferred()      
		}; 
		var str = JSON.stringify({      
			jsonrpc: "2.0",             
			id: req.id,                 
			method: method,             
			params: params || []        
		})+"\n";                        
		//console.log("websocket > "+str);         
		try {
			self.socket.send(str); 
		} catch(e){
			console.error("Websocket error: "+e); 
			req.deferred.reject(); 
			self.requests[req.id] = undefined; 
			self.socket.onclose(); 
		}
        return req.deferred.promise();  
    }
/*
	RevoRPC.prototype.$authenticate = function(){
		var self = this; 
		var sid = scope.localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
		var def = $.Deferred(); 
		self.$request("authenticate", [sid]).done(function(response){
			self.sid = sid; 
			_session_data = response; 
			def.resolve(); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}
*/	
	RevoRPC.prototype.$call = function(object, method, data){
		var sid = localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
		//data._ubus_session_id = sid; 
		return this.$request("call", [sid, object, method, data]); 
	}

	RevoRPC.prototype.$subscribe = function(name, func){
		if(!this.events[name]) this.events[name] = []; 
		this.events[name].push(func); 
	}

	RevoRPC.prototype.$list = function(){
		var sid = localStorage.getItem("sid")||RPC_DEFAULT_SESSION_ID; 
		return this.$request("list", [sid || "", "*"]); 
	}
	
	RevoRPC.prototype.$register = function(object, method){
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
						return self.$call(object, method, data); 
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
	}

	RevoRPC.prototype.$isConnected = function(){
		return this.connected; 
	}

	RevoRPC.prototype.$isLoggedIn = function(){
		return this.loggedin; 
	}

	RevoRPC.prototype.$init = function(host){
		var self = this; 
		var deferred = $.Deferred(); 
		// request list of all methods and construct rpc object containing all of the methods in javascript. 
		self.$list().done(function(result){
			Object.keys(result).map(function(obj){
				Object.keys(result[obj]).map(function(method){
					//console.log("Adding method "+method); 
					self.$register(obj, method); 
				}); 
			}); 
			deferred.resolve(); 
		}).fail(function(){
			deferred.reject(); 
		}); 
		return deferred.promise(); 
	}

	scope.UBUS = scope.$rpc = new RevoRPC(); 
})(typeof exports === 'undefined'? this : global); 


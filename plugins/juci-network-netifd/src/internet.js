!function(){

	JUCI.app.factory("$network", function($rpc, $uci){
		function _refreshClients(self){
			var deferred = $.Deferred(); 
			$rpc.router.clients().done(function(clients){
				self.clients = Object.keys(clients).map(function(x){
					return clients[x]; 
				}); 
				deferred.resolve(self.clients);  
			}).fail(function(){ deferred.reject(); });
			return deferred.promise(); 
		}
		
		function NetworkDevice(){
			this.name = ""; 
		}
		
		function NetworkBackend() {
			this.clients = []; 
			this._subsystems = []; 
			this._devices = null; 
		}
		
		NetworkBackend.prototype.subsystem = function(proc){
			if(!proc || !(proc instanceof Function)) throw new Error("Subsystem argument must be a function returning a subsystem object!"); 
			var subsys = proc(); 
			if(!subsys.getDevices) throw new Error("Subsystem must implement getDevices()"); 
			this._subsystems.push(subsys); 
		}
		
		NetworkBackend.prototype.getDevice = function(opts){
			var deferred = $.Deferred(); 
			var self = this; 
			if(self._devices){
				var dev = self._devices.find(function(x){ return x.name == opts.name; }); 
				if(dev){
					setTimeout(function(){deferred.resolve(dev); },0); 
				} else {
					setTimeout(function(){deferred.reject(); },0); 
				}
			} else {
				self.getDevices().done(function(devices){
					var dev = devices.find(function(x){ return x.name == opts.name; }); 
					if(dev){
						deferred.resolve(dev); 
					} else {
						deferred.reject(); 
					}
				}).fail(function(){
					deferred.reject(); 
				}); 
			}
			return deferred.promise(); 
		}; 
		
		// getEthernetDevices
		NetworkBackend.prototype.getDevices = function(){
			var deferred = $.Deferred();  
			var devices = []; 
			var self = this; 
			// go through each registered subsystem and get all devices from it. 
			async.eachSeries(this._subsystems, function(subsys, next){
				subsys.getDevices().done(function(devs){
					devices = devices.concat(devs); 
					//devs.map(function(d){ devices[d.name] = d; }); 
				}).always(function(){ next(); }); 
			}, function(){
				self._devices = devices; 
				deferred.resolve(devices); 
			}); 
			return deferred.promise(); 
		}
		
		// getVirtualDevices
		NetworkBackend.prototype.getNetworks = function(){
			var deferred = $.Deferred(); 
			var networks = []; 
			var self = this; 
			var devmap = {}; 
			async.series([
				function(next){
					self.getDevices().done(function(devs){
						devs.map(function(x){ devmap[x.name] = x; }); 
					}).always(function(){ next(); }); 
				}, function(next){
					$uci.sync("network").done(function(){
						$uci.network["@interface"].map(function(i){
							i.devices = []; 
							i.ifname.value.split(" ").map(function(name){
								if(name in devmap) i.devices.push(devmap[name]); 
							}); 
							if(i[".name"] == "loopback") return; 
							networks.push(i); 
						}); 
					}).always(function(){
						next(); 
					}); 
				}
			], function(){
				deferred.resolve(networks); 
			}); 
			
			return deferred.promise(); 
		}
		
		
		NetworkBackend.prototype.getClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			_refreshClients(self).done(function(clients){
				deferred.resolve(clients); 
			}); 
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getConnectedClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			_refreshClients(self).done(function(clients){
				
				deferred.resolve(clients.filter(function(x){ return x.connected; })); 
			}); 
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getLanNetworks = function(){
			var deferred = $.Deferred(); 
			this.getNetworks().done(function(nets){
				deferred.resolve(nets.filter(function(x){ return x.is_lan.value == 1; })); 
			}); 
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getWanNetworks = function(){
			var deferred = $.Deferred(); 
			this.getNetworks().done(function(nets){
				deferred.resolve(nets.filter(function(x){ return x.is_lan.value == 0; })); 
			}); 
			return deferred.promise(); 
		}
		
		return new NetworkBackend(); 
	}); 
	
	// register basic vlan support 
	JUCI.app.run(function($network, $uci, $rpc){
		$network.subsystem(function(){
			return {
				getDevices: function(){
					var deferred = $.Deferred(); 
					var devices = []; 
					/* Do not add loopback device for now because we hardly ever use it and it is basically filtered in all interfaces. 
					var devices = [{
						get name(){ return "loopback"; },
						get id() { return "lo"; },  
						get type(){ return "baseif"; }, 
						base: { name: "loopback", id: "lo" }
					}]; */
					$rpc.router.boardinfo().done(function(boardinfo){
						$uci.sync("layer2_interface_ethernet").done(function(){
							var names = boardinfo.ethernet.port_names.split(" "); 
							var devs = boardinfo.ethernet.port_order.split(" "); 
							devs.map(function(dev, i){
								devices.push({
									get name(){ return names[i]; },
									get id(){ return dev; },
									get type(){ return "baseif"; },
									base: { name: names[i], id: dev }
								}); 
							}); 
							$uci.layer2_interface_ethernet["@ethernet_interface"].map(function(i){
								devices.push({
									get name(){ return i.name.value; },
									get id(){ return i.ifname.value; },
									get type(){ return "baseif"; },
									base: { name: i.name.value, id: i.ifname.value }
								}); 
							}); 
							deferred.resolve(devices); 
						}); 
					}).fail(function(){
						deferred.reject(); 
					}); ; 
					return deferred.promise(); 
				}
			}
		}); 
	}); 
}(); 

UCI.validators.IPAddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match(/^\b(?:\d{1,3}\.){3}\d{1,3}\b$/)) return gettext("IP Address must be a valid ipv4 address!"); 
		return null;
	}
}; 

UCI.validators.MACAddressValidator = function(){
	this.validate = function(field){
		if(!(typeof field.value == "string") ||
			!field.value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/)) 
			return gettext("Value must be a valid MAC-48 address"); 
		return null; 
	}
}; 

UCI.validators.MACListValidator = function(){
	this.validate = function(field){
		if(field.value instanceof Array){
			var errors = []; 
			field.value.map(function(value){
				if(!value.match(/^(?:[A-Fa-f0-9]{2}[:-]){5}(?:[A-Fa-f0-9]{2})$/))
					errors.push(gettext("value must be a valid MAC-48 address")+": "+value); 
			}); 
			if(errors.length) return errors.join(", "); 
		}
		return null; 
	}
}; 

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":					{ dvalue: false, type: Boolean }, 
	"ifname":					{ dvalue: '', type: String }, 
	"device":					{ dvalue: '', type: String }, // WTF? This is set to ifname in ubus but not in uci 
	"proto":					{ dvalue: '', type: String }, 
	"ipaddr":					{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask":				{ dvalue: '', type: String }, 
	"gateway":				{ dvalue: '', type: String }, 
	"ip6addr":				{ dvalue: '', type: String }, 
	"ip6prefix":			{ dvalue: '', type: String }, 
	"ip6gateway":			{ dvalue: '', type: String }, 
	"type":						{ dvalue: '', type: String }, 
	"ip6assign":			{ dvalue: 60, type: Number }, 
	"bridge_instance": { dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"hostname":				{ dvalue: '', type: String }, 
	"ipv6":						{ dvalue: false, type: Boolean },
	"peerdns": 				{ dvalue: true, type: Boolean }, 
	"dns": 						{ dvalue: [], type: Array }, 
	"enabled": 				{ dvalue: true, type: Boolean }
}); 

UCI.network.$registerSectionType("route", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }
}); 


UCI.$registerConfig("layer2_interface_ethernet"); 
UCI.layer2_interface_ethernet.$registerSectionType("ethernet_interface", {
	"name":					{ dvalue: '', type: String }, 
	"ifname":					{ dvalue: '', type: String }, 
	"baseifname":					{ dvalue: '', type: String }
}); 

UCI.$registerConfig("ddns");
UCI.ddns.$registerSectionType("service", {
	"enabled":              { dvalue: 0, type: Number },
	"interface":            { dvalue: "", type: String },
	"use_syslog":           { dvalue: 0, type: Number },
	"service_name":         { dvalue: "", type: String },
	"domain":               { dvalue: "", type: String },
	"username":             { dvalue: "", type: String },
	"password":             { dvalue: "", type: String }
});
			

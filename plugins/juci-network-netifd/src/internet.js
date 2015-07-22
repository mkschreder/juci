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
		
		NetworkBackend.prototype.getConnectedClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			_refreshClients(self).done(function(clients){
				
				deferred.resolve(clients.filter(function(x){ return x.connected; })); 
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
					var devices = [{
						get name(){ return "loopback"; },
						get id() { return "lo"; },  
						get type(){ return "baseif"; }
					}]; 
					$rpc.router.boardinfo().done(function(boardinfo){
						var names = boardinfo.ethernet.port_names.split(" "); 
						var devs = boardinfo.ethernet.port_order.split(" "); 
						devs.map(function(dev, i){
							devices.push({
								get name(){ return names[i]; },
								get id(){ return dev; },
								get type(){ return "baseif"; }
							}); 
						}); 
						deferred.resolve(devices); 
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
	"peerdns": 				{ dvalue: false, type: String }, 
	"dns": 						{ dvalue: [], type: Array }
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
			
UCI.$registerConfig("firewall"); 
UCI.firewall.$registerSectionType("defaults", {
	"syn_flood":		{ dvalue: true, type: Boolean }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }
}); 
UCI.firewall.$registerSectionType("zone", {
	"name":					{ dvalue: "", type: String }, 
	"input":				{ dvalue: "ACCEPT", type: String }, 
	"output":				{ dvalue: "ACCEPT", type: String }, 
	"forward":			{ dvalue: "REJECT", type: String }, 
	"network": 			{ dvalue: [], type: Array }, 
	"masq":					{ dvalue: true, type: Boolean }, 
	"mtu_fix": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("redirect", {
	"name":					{ dvalue: "", type: String }, 
	"src":					{ dvalue: "", type: String }, 
	"dest":					{ dvalue: "", type: String }, 
	"src_ip":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  },
	"src_dport":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator },
	"proto":				{ dvalue: "", type: String }, 
	"dest_ip":			{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator  }, 
	"dest_port":		{ dvalue: "", type: String, validator: UCI.validators.PortValidator }
}); 
UCI.firewall.$registerSectionType("include", {
	"path": 				{ dvalue: "", type: String }, 
	"type": 				{ dvalue: "", type: String }, 
	"family": 			{ dvalue: "", type: String }, 
	"reload": 			{ dvalue: true, type: Boolean }
}); 
UCI.firewall.$registerSectionType("dmz", {
	"enabled": 			{ dvalue: false, type: Boolean }, 
	"host": 				{ dvalue: "", type: String } // TODO: change to ip address
}); 
UCI.firewall.$registerSectionType("rule", {
	"type": 				{ dvalue: "generic", type: String }, 
	"name":					{ dvalue: "", type: String }, 
	"src":					{ dvalue: "lan", type: String }, 
	"src_ip":				{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
	"src_port":			{ dvalue: 0, type: Number }, 
	"proto":				{ dvalue: "tcp", type: String }, 
	"dest":					{ dvalue: "*", type: String }, 
	"dest_ip":			{ dvalue: "", type: String }, // needs to be extended type of ip address/mask
	"dest_port":		{ dvalue: 0, type: Number }, 
	"target":				{ dvalue: "REJECT", type: String }, 
	"family": 			{ dvalue: "ipv4", type: String }, 
	"icmp_type": 		{ dvalue: [], type: Array },
	"enabled": 			{ dvalue: true, type: Boolean },
	"hidden": 			{ dvalue: true, type: Boolean }, 
	"limit":				{ dvalue: "", type: String }, 
	// scheduling
	"parental": 			{ dvalue: false, type: String }, 
	"weekdays":				{ dvalue: "", type: String }, 
	"start_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
	"stop_time":			{ dvalue: "", type: String, validator:  UCI.validators.TimeValidator }, 
}); 
UCI.firewall.$registerSectionType("settings", {
	"disabled":			{ dvalue: false, type: Boolean },
	"ping_wan":			{ dvalue: false, type: Boolean }
}); 
UCI.firewall.$registerSectionType("urlblock", {
	"enabled": { dvalue: false, type: Boolean }, 
	"url": 					{ dvalue: [], type: Array }, 
	"src_mac": 			{ dvalue: [], type: Array, validator: UCI.validators.MACListValidator }, 
}); 


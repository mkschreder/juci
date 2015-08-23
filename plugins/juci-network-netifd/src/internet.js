//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
!function(){

	JUCI.app.factory("$network", function($rpc, $uci){
		function _refreshClients(self){
			var deferred = $.Deferred(); 
			$rpc.juci.network.clients().done(function(res){
				if(res && res.clients){
					self.clients = res.clients; 
					deferred.resolve(self.clients);  
				} else {
					deferred.reject(); 
				}
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
		
		NetworkBackend.prototype.getAdapters = function(){
			var deferred = $.Deferred();  
			$rpc.juci.network.adapters().done(function(result){
				if(result && result.adapters) deferred.resolve(result.adapters); 
				else deferred.reject(); 
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
		
		NetworkBackend.prototype.getConnectedClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			
			_refreshClients(self).done(function(clients){
				deferred.resolve(clients); 
			}).fail(function(){
				deferred.reject(); 
			});  
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getNameServers = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			$rpc.juci.network.nameservers().done(function(result){
				if(result && result.nameservers) deferred.resolve(result.nameservers); 
				else deferred.reject(); 
			}); 
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getNetworkLoad = function(){
			var def = $.Deferred(); 
			
			$rpc.juci.network.load().done(function(res){
				def.resolve(res); 
			});
			
			return def.promise(); 
		}
		
		NetworkBackend.prototype.getNatTable = function(){
			var def = $.Deferred(); 
			
			$rpc.juci.network.nat_table().done(function(result){
				if(result && result.table){
					def.resolve(result.table); 
				} else {
					def.reject(); 
				}
			}); 
			return def.promise(); 
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
		
		NetworkBackend.prototype.getServices = function(){
			var def = $.Deferred(); 
			$rpc.juci.network.lua.services().done(function(result){
				if(result && result.list) def.resolve(result.list); 
				else def.reject(); 
			}); 
			return def.promise(); 
		}
		
		return new NetworkBackend(); 
	}); 
	
	// register basic vlan support 
	JUCI.app.run(function($network, $uci, $rpc, $events, gettext, $tr){
		$events.subscribe("dongle-up", function(ev){
			alert($tr(gettext("Your dongle ({0}) has been configured as wan port internet device.".format(ev.data.device)))); 
		}); 
		$events.subscribe("dongle-down", function(ev){
			alert($tr(gettext("Dongle has been disconnected!"))); 
		}); 
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
					$rpc.network.interface.dump().done(function(res){
						var infos = res.interface; 
						$rpc.juci.system.info().done(function(sysinfo){
							$uci.sync("layer2_interface_ethernet").done(function(){
								// match adapters with device names in configuration (quite ugly right now!)
								// TODO: unuglify
								$network.getAdapters().done(function(devs){
									devs.map(function(dev){
										var info = infos.find(function(i){ return i.device == dev.name }); 
										var wanport = $uci.layer2_interface_ethernet["@ethernet_interface"].find(function(i){ return i.ifname.value == dev.name; }); 
										var ethport = sysinfo.eth_ports.find(function(i){ return i.device == dev.name; }); 
										var name = dev.name; 
										if(wanport) name = "VLAN-"+wanport.name.value; 
										else if(ethport) name = "PORT-"+ethport.name;
										else if(info) name = "VIF-"+info.interface.toUpperCase();  
										devices.push({
											get name(){ return name; },
											get id(){ return dev.name; },
											get type(){ return "baseif"; },
											get up() { return dev.state == "UP" }, 
											set bridged(value){ if(wanport) wanport.bridge.value = true }, 
											get is_wan_port() { return (wanport)?true:false; }, 
											get loopback() { return dev.flags.match(/LOOPBACK/); },
											base: dev
										}); 
									}); 
									deferred.resolve(devices); 
								}); 
							}); 
						}).fail(function(){
							deferred.reject(); 
						});
					}).fail(function(){
						deferred.reject(); 
					});
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
	"is_lan":					{ dvalue: false, type: Boolean }, // please stop relying on this!
	"ifname":					{ dvalue: '', type: String }, 
	"device":					{ dvalue: '', type: String }, 
	"proto":					{ dvalue: '', type: String }, 
	"proto6":					{ dvalue: '', type: String }, 
	"ipaddr":					{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask":				{ dvalue: '', type: String }, 
	"gateway":				{ dvalue: '', type: String }, 
	"ip6addr":				{ dvalue: '', type: String }, 
	"ip6prefix":			{ dvalue: '', type: String }, 
	"ip6gateway":			{ dvalue: '', type: String }, 
	"type":						{ dvalue: 'none', type: String }, 
	"defaultroute":		{ dvalue: false, type: Boolean }, 
	"ip6assign":			{ dvalue: 60, type: Number }, 
	"bridge_instance": { dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"ipv6":						{ dvalue: false, type: Boolean },
	"dns": 						{ dvalue: [], type: Array }, 
	"enabled": 				{ dvalue: true, type: Boolean }, 
	// dhcp settings
	"broadcast": 			{ dvalue: false, type: Boolean }, 
	"hostname": 			{ dvalue: "", type: String }, 
	"peerdns": 				{ dvalue: true, type: Boolean }, 
	// authentication 
	"auth": 					{ dvalue: "", type: String }, 
	"username": 			{ dvalue: "", type: String }, 
	"password": 			{ dvalue: "", type: String }, 
	// 3g and dongles
	"apn": 						{ dvalue: "", type: String }, 
	"pincode": 				{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("route", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }
}); 


UCI.$registerConfig("layer2_interface_ethernet"); 
UCI.layer2_interface_ethernet.$registerSectionType("ethernet_interface", {
	"name":						{ dvalue: '', type: String }, 
	"ifname":					{ dvalue: '', type: String }, 
	"baseifname":			{ dvalue: '', type: String },
	"bridge":					{ dvalue: false, type: Boolean }
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
			

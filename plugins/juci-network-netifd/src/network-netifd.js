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

!function(){
	// add control dependency 
	JUCI.app.requires.push("dropdown-multi-select");

	JUCI.app.factory("$network", function($rpc, $uci, $ethernet){
		var sync_hosts = $uci.$sync("hosts"); 
		function _refreshClients(self){
			var deferred = $.Deferred(); 
			$rpc.juci.network.clients().done(function(res){
				sync_hosts.done(function(){
					if(res && res.clients){
						self.clients = res.clients.map(function(cl){
							// update clients with some extra information from hosts database
							var key = cl.macaddr.replace(/:/g, "_"); 
							if($uci.hosts[key]) {
								var host = $uci.hosts[key]; 
								console.log("Found host for "+key); 
								cl.manufacturer = host.manufacturer.value; 
								if(host.name) cl.name = host.name.value; 
							}
							return cl; 
						}); 
						deferred.resolve(self.clients);  
					} else {
						deferred.reject(); 
					}
				}); 
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
			if(!subsys.annotateClients) throw new Error("Subsystem must implement annotateClients()"); 
			this._subsystems.push(subsys); 
		}
		
		NetworkBackend.prototype.getDevice = function(opts){
			alert("$network.getDevice has been removed. No alternative. "); 
		}; 
		
		NetworkBackend.prototype.getDevices = function(){
			alert("$network.getDevices has been removed. Use $ethernet.getDevices instead!"); 
		}
		
		// should be renamed to getInterfaces for NETWORK (!) interfaces. 
		NetworkBackend.prototype.getNetworks = function(opts){
			var deferred = $.Deferred(); 
			var filter = filter || {}; 
			var networks = []; 
			var self = this; 
			var devmap = {}; 
			if(!opts) opts = {}; 
			var filter = opts.filter || {};
			var info = {};
			async.series([
				function(next){
					$ethernet.getAdapters().done(function(devs){
						devs.map(function(x){ devmap[x.name] = x; }); 
					}).always(function(){ next(); }); 
				}, function(next){
					$uci.$sync("network").done(function(){
						$uci.network["@interface"].map(function(i){
							i.devices = []; 
							var fixed = i.ifname.value.split(" ").filter(function(name){
								return name && name != ""; 
							}).map(function(name){
								if(name in devmap) i.devices.push(devmap[name]); 
								return name; 
							}).join(" "); 
							i.ifname.value = fixed;
							if(i[".name"] == "loopback") return; 
							if(filter.no_aliases && i[".name"].indexOf("@") == 0 || i.type.value == "alias") return; 
							networks.push(i); 
						}); 
					}).always(function(){
						next(); 
					}); 
				}, function(next){
					$rpc.network.interface.dump().done(function(result){
						if(result && result.interface) {
							info = result.interface;
						}
					}).always(function(){
						next();
					}); 
				}
			], function(){
				if(info){
					networks = networks.map(function(x){
						// set $info to the information gathered from network.interface.dump() or undefined
						x.$info = info.find(function(y){ return x[".name"] == y.interface; });
						return x;
					});
				}
				deferred.resolve(networks); 
			}); 
			
			return deferred.promise(); 
		}
		
		NetworkBackend.prototype.getConnectedClients = function(){
			var deferred = $.Deferred(); 
			var self = this; 
			
			_refreshClients(self).done(function(clients){
				async.each(self._subsystems, function(sys, next){
					if(sys.annotateClients) {
						sys.annotateClients(clients).always(function(){ next(); }); 
					} else {
						next(); 
					}
				}, function(){
					clients.map(function(cl){
						if(!cl._display_widget) cl._display_widget = "network-client-lan-display-widget"; 
					}); 
					deferred.resolve(clients); 
				});
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
			console.log("$network.getWanNetworks() is deprecated. You should list firewall zone wan to get whole list"); 
			this.getNetworks().done(function(nets){
				deferred.resolve(nets.filter(function(x){ return !x.is_lan.value; })); 
			}); 
			return deferred.promise(); 
		}
		
		// returns list of config sections belong to devices that are configured as default routes along with their runtime info in $info field
		NetworkBackend.prototype.getDefaultRouteNetworks = function(){
			var def = $.Deferred(); 
	
			$uci.$sync("network").done(function(){
				$rpc.network.interface.dump().done(function(result){
					if(result && result.interface) {
						var wanifs = []; 
						result.interface.map(function(i){
							if(i.route && i.route.length && i.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; })){
								// lookup the config section for this device 
								var conf = $uci.network["@interface"].find(function(x){ return x[".name"] == i.interface; }); 
								if(conf) {	
									conf.$info = i; 
									wanifs.push(conf); 
								}
							}
						}); 
						def.resolve(wanifs); 
					} else {
						def.reject(); 
					}
				}).fail(function(){
					def.reject(); 
				}); 
			}).fail(function(){
				def.reject(); 
			}); 

			return def.promise(); 
		}	

		NetworkBackend.prototype.getServices = function(){
			var def = $.Deferred(); 
			$rpc.juci.network.services().done(function(result){
				if(result && result.list) def.resolve(result.list); 
				else def.reject(); 
			}); 
			return def.promise(); 
		}
		
		return new NetworkBackend(); 
	}); 
	
	// register basic vlan support 
	JUCI.app.run(function($network, $uci, $rpc, $events, gettext, $tr, $ethernet, networkConnectionPicker){
		$events.subscribe("hotplug.net", function(ev){
			if(ev.data.action == "add"){
				// we need to make sure that the new device is not already added to a network. 
				$uci.$sync("network").done(function(){
					var found = $uci.network["@interface"].find(function(net){
						return net.ifname.value.split(" ").find(function(x){ return x == ev.data.interface; }); 
					}); 
					// currently does not work correctly
					/*if(!found){
						if(confirm($tr(gettext("A new ethernet device has been connected to your router. Do you want to add it to a network?")))){
							networkConnectionPicker.show().done(function(picked){
								picked.ifname.value = picked.ifname.value.split(" ").concat([ev.data.interface]).join(" "); 
								$uci.$save(); 
							});
						}
					}*/ 
				}); 
			}
		}); 
	}); 
}(); 

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":				{ dvalue: false, type: Boolean }, // please stop relying on this!
	"auto": 				{ dvalue: true, type: Boolean }, // bring up on boot
	"ifname":				{ dvalue: '', type: String }, 
	"device":				{ dvalue: '', type: String }, 
	"proto":				{ dvalue: '', type: String }, 
	"ipaddr":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"netmask":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValdator }, 
	"gateway":				{ dvalue: '', type: String }, 
	"ip6addr":				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gw": 				{ dvalue: '', type: String },
	"ip6prefix":			{ dvalue: '', type: String }, 
	"ip6gateway":			{ dvalue: '', type: String },  
	"ip6assign":			{ dvalue: null, type: Number }, 
	"ip6hint": 				{ dvalue: '', type: String },
	"clientid": 			{ dvalue: "", type: String },
	"type":					{ dvalue: '', type: String }, 
	"defaultroute":			{ dvalue: false, type: Boolean },	
	"bridge_instance": 		{ dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"ipv6":					{ dvalue: false, type: Boolean },
	"dns": 					{ dvalue: [], type: Array }, 
	"macaddr":				{ dvalue: "", type: String }, 
	"mtu":					{ dvalue: null, type: Number },
	"enabled": 				{ dvalue: true, type: Boolean }, 
	// dhcp settings
	// "broadcast": 			{ dvalue: false, type: Boolean }, 
	"hostname": 			{ dvalue: "", type: String }, 
	"peerdns": 				{ dvalue: true, type: Boolean }, 
	// authentication 
	"auth": 				{ dvalue: "", type: String }, 
	"username": 			{ dvalue: "", type: String }, 
	"password": 			{ dvalue: "", type: String }, 
	// 3g and dongles
	"apn": 					{ dvalue: "", type: String }, 
	"pincode": 				{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("route", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }, 
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: 1500, type: Number }
}); 

UCI.network.$registerSectionType("route6", {
	"interface": 			{ dvalue: "", type: String }, 
	"target": 				{ dvalue: "", type: String }, 
	"gateway": 				{ dvalue: "", type: String },
	"metric": 				{ dvalue: 0, type: Number },
	"mtu": 					{ dvalue: 1500, type: Number }
}); 

UCI.network.$registerSectionType("switch", {
	"name": 	{ dvalue: "", type: String },
	"reset":	{ dvalue: undefined, type: Boolean }, 
	"enable_vlan": { dvalue: true, type: Boolean },
	"enable": 	{ dvalue: false, type: Boolean }
}); 

UCI.network.$registerSectionType("switch_vlan", {
	"displayname": { dvalue: "", type: String },
	"vlan":		{ dvalue: 0, type: Number }, 
	"device": 	{ dvalue: "", type: String },
	"ports": 	{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("switch_port_label", {
	"name": 	{ dvalue: "", type: String }, 
	"id": 		{ dvalue: undefined, type: Number }
}); 

UCI.network.$registerSectionType("switch_port", {
	"port": 	{ dvalue: 0, type: Number }, 
	"pvid": 	{ dvalue: 0, type: Number }
}); 

UCI.$registerConfig("hosts");
UCI.hosts.$registerSectionType("host", {
	"device":            { dvalue: "", type: String },
	"macaddr":         { dvalue: "", type: String },
	"ipaddr":               { dvalue: "", type: String },
	"name":             { dvalue: "", type: String },
	"manufacturer":             { dvalue: "", type: String },
	"hostname":		{ dvalue: "", type: String, required: true}, 
	"macaddr":		{ dvalue: "", type: String, match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, required: true}
});

UCI.juci.$registerSectionType("network", {
	"wan4_interface": 	{ dvalue: "wan", type: String }, // default wan4 interface name 
	"wan6_interface": 	{ dvalue: "wan6", type: String }, // default wan6 interface name 
	"voice_interface": 	{ dvalue: "wan", type: String }, 
	"iptv_interface": 	{ dvalue: "wan", type: String }
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
!function(){

	JUCI.app.factory("$network", function($rpc, $uci){
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
				// use timeout because we will be not be deferred yet if no subsystems are present 
				setTimeout(function(){ deferred.resolve(devices); },0); 
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
	JUCI.app.run(function($network, $uci, $rpc, $events, gettext, $tr, $ethernet, networkConnectionPicker){
		/*$events.subscribe("dongle-up", function(ev){
			alert($tr(gettext("Your dongle ({0}) has been configured as wan port internet device.".format(ev.data.device)))); 
		}); 
		$events.subscribe("dongle-down", function(ev){
			alert($tr(gettext("Dongle has been disconnected!"))); 
		}); */
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
								$uci.save(); 
							});
						}
					}*/ 
				}); 
			}
		}); 
		/*$network.subsystem(function(){
			return {
				getDevices: function(){
					var deferred = $.Deferred(); 
					var devices = []; 
					$rpc.network.interface.dump().done(function(res){
						var infos = res.interface; 
						$rpc.juci.system.info().done(function(sysinfo){
							$uci.$sync("layer2_interface_ethernet").done(function(){
								// match adapters with device names in configuration (quite ugly right now!)
								// TODO: unuglify
								$ethernet.getAdapters().done(function(devs){
									devs.map(function(dev){
										var info = infos.find(function(i){ return i.device == dev.device }); 
										var wanport = $uci.layer2_interface_ethernet["@ethernet_interface"].find(function(i){ return i.ifname.value == dev.device; }); 
										var ethport = sysinfo.eth_ports.find(function(i){ return i.device == dev.device; }); 
										var name = dev.device; 
										if(wanport) name = "VLAN-"+wanport.name.value; 
										else if(ethport) name = "PORT-"+ethport.name;
										else if(info) name = "VIF-"+info.interface.toUpperCase();  
										devices.push({
											get name(){ return name; },
											get id(){ return dev.device; },
											get type(){ return "baseif"; },
											get up() { return dev.state == "UP" }, 
											set bridged(value){ if(wanport) wanport.bridge.value = true }, 
											get is_wan_port() { return (wanport)?true:false; }, 
											get loopback() { return (dev.flags && dev.flags.match(/LOOPBACK/)); },
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
		});*/ 
	}); 
}(); 

UCI.validators.IPAddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match(/^\b(?:\d{1,3}\.){3}\d{1,3}\b$/)) return gettext("IP Address must be a valid ipv4 address!"); 
		return null;
	}
}; 

UCI.validators.IP6AddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match("("+
			"([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|"+ //          # 1:2:3:4:5:6:7:8
			"([0-9a-fA-F]{1,4}:){1,7}:|"+ //                         # 1::                              1:2:3:4:5:6:7::
			"([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|"+ //         # 1::8             1:2:3:4:5:6::8  1:2:3:4:5:6::8
			"([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|"+ //  # 1::7:8           1:2:3:4:5::7:8  1:2:3:4:5::8
			"([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|"+ //  # 1::6:7:8         1:2:3:4::6:7:8  1:2:3:4::8
			"([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|"+ //  # 1::5:6:7:8       1:2:3::5:6:7:8  1:2:3::8
			"([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|"+ //  # 1::4:5:6:7:8     1:2::4:5:6:7:8  1:2::8
			"[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|"+ //       # 1::3:4:5:6:7:8   1::3:4:5:6:7:8  1::8  
			":((:[0-9a-fA-F]{1,4}){1,7}|:)|"+ //                     # ::2:3:4:5:6:7:8  ::2:3:4:5:6:7:8 ::8       ::     
			"fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|"+ //     # fe80::7:8%eth0   fe80::7:8%1     (link-local IPv6 addresses with zone index)
			"::(ffff(:0{1,4}){0,1}:){0,1}"+ //
			"((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}"+ //
			"(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|"+ //          # ::255.255.255.255   ::ffff:255.255.255.255  ::ffff:0:255.255.255.255  (IPv4-mapped IPv6 addresses and IPv4-translated addresses)
			"([0-9a-fA-F]{1,4}:){1,4}:"+ //
			"((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}"+ //
			"(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])"+ //           # 2001:db8:3:4::192.0.2.33  64:ff9b::192.0.2.33 (IPv4-Embedded IPv6 Address)
			")")) return gettext("IPv6 Aaddress must be a valid ipv6 address"); 
		return null; 
	}
} 

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
	"is_lan":				{ dvalue: false, type: Boolean }, // please stop relying on this!
	"auto": 				{ dvalue: true, type: Boolean }, // bring up on boot
	"ifname":				{ dvalue: '', type: String }, 
	"device":				{ dvalue: '', type: String }, 
	"proto":				{ dvalue: '', type: String }, 
	"ipaddr":				{ dvalue: '', type: String, validator: UCI.validators.IPAddressValidator }, 
	"netmask":				{ dvalue: '', type: String }, 
	"gateway":				{ dvalue: '', type: String }, 
	"ip6addr":				{ dvalue: '', type: String }, 
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
	"gateway": 				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator }
}); 

UCI.network.$registerSectionType("switch", {
	"enable": 	{ dvalue: false, type: Boolean }
}); 

UCI.network.$registerSectionType("switch_vlan", {
	"vlan":		{ dvalue: 0, type: Number }, 
	"device": 	{ dvalue: "", type: String },
	"ports": 	{ dvalue: "", type: String }
}); 

UCI.network.$registerSectionType("switch_port", {
	"port": 	{ dvalue: 0, type: Number }, 
	"pvid": 	{ dvalue: 0, type: Number }
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
			

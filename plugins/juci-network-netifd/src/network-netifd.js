//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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
								$uci.save(); 
							});
						}
					}*/ 
				}); 
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

UCI.validators.IP6PrefixLengthValidator = function(){
	this.validate = function(field){
		var valid_values = ["no"];
		for(var i = 48; i <= 64; i++){
			valid_values.push(String(i));
		}
		if(field.value == "" || valid_values.find(function(x){ return x == field.value}) != undefined) return null;
		return gettext("valid values are: 'no' and 48-64");
	}
};

UCI.validators.IP6AddressValidator = function(){
	this.validate = function(field){
		if(field.value && field.value != "" && !field.value.match("^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$")) return gettext("Aaddress must be a valid IPv6 address"); 
		return null; 
	}
} 

UCI.validators.MACAddressValidator = function(){
	this.validate = function(field){
		if(field.value == "") return null;
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

UCI.validators.REQPrefixValidator = function(){
	this.validate = function(field){
		if(field.value == "auto" || field.value == "no") return null; // ok string values
		var number = parseInt(field.value);
		if(number < 65 && number > -1) return null;
		return gettext("Valid values are: auto, no, 0-64");
	}
};

UCI.$registerConfig("network"); 
UCI.network.$registerSectionType("interface", {
	"is_lan":				{ dvalue: false, type: Boolean }, // please stop relying on this!
	"auto": 				{ dvalue: true, type: Boolean }, // bring up on boot
	"ifname":				{ dvalue: '', type: String }, 
	"device":				{ dvalue: '', type: String }, 
	"proto":				{ dvalue: '', type: String }, 
	"ipaddr":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"netmask":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"gateway":				{ dvalue: '', type: String, validator: UCI.validators.IP4AddressValidator }, 
	"ip6addr":				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gw": 				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },
	"ip6prefix":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator }, 
	"ip6gateway":			{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },  
	"ip6assign":			{ dvalue: '', type: Number }, 
	"ip6hint": 				{ dvalue: '', type: String, validator: UCI.validators.IP6AddressValidator },
	"clientid": 			{ dvalue: "", type: String },
	"type":					{ dvalue: '', type: String }, 
	"defaultroute":			{ dvalue: true, type: Boolean },	
	"bridge_instance": 		{ dvalue: false, type: Boolean }, 
	"vendorid":				{ dvalue: '', type: String }, 
	"ipv6":					{ dvalue: false, type: Boolean },
	"dns": 					{ dvalue: [], type: Array }, 
	"macaddr":				{ dvalue: "", type: String, validator: UCI.validators.MACAddressValidator }, 
	"mtu":					{ dvalue: "", type: Number },
	"enabled": 				{ dvalue: true, type: Boolean }, 
	//dhcp settings
	"reqopts":				{ dvalue: "", type: String },
	"metric":				{ dvalue: 0, type: Number },
	"iface6rd":				{ dvalue: "", type: String },
	"broadcast": 			{ dvalue: false, type: Boolean }, 
	"hostname": 			{ dvalue: "", type: String }, 
	"peerdns": 				{ dvalue: true, type: Boolean }, 
	//ipv6 settings
	"tunlink":				{ dvalue: "", type: String },
	"ip6prefixlen":			{ dvalue: "", type: String, validator: UCI.validators.IP6PrefixLengthValidator },
	"ip4prefixlen":			{ dvalue: "", type: Number },
	"reqprefix":			{ dvalue: "auto", type: String, validator: UCI.validators.REQPrefixValidator },
	"reqaddress":			{ dvalue: "try", type: String },
	// authentication 
	"auth": 				{ dvalue: "", type: String }, 
	"username": 			{ dvalue: "", type: String }, 
	"password": 			{ dvalue: "", type: String }, 
	// ppp settings
	"tunnelid":				{ dvalie: "", type: Number },
	"_update":				{ dvalue: false, type: Boolean },
	"peeraddr":				{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"server":				{ dvalue: "", type: String },
	"_keepalive_failure":	{ dvalue: "", type: Number },
	"_keepalive_interval":	{ dvalue: "", type: Number },
	"demand":				{ dvalue: "", type: Number },
	// pppoe settings
	"ac":					{ dvalue: "", type: String },
	// 3g and dongles
	"modem":				{ dvalue: "", type: String },
	"service":				{ dvalue: "", type: String },
	"maxwait":				{ dvalue: "", type: Number },
	"apn": 					{ dvalue: "", type: String }, 
	"pincode": 				{ dvalue: "", type: String },
	"comdev":				{ dvalue: "", type: String },
	"ttl":					{ dvalue: "", type: Number }
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

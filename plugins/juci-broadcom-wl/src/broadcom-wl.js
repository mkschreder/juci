//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
	
JUCI.app.run(function($network, $uci, $wireless){
	$network.subsystem(function(){
		return {
			annotateClients: function(clients){
				var def = $.Deferred(); 
				$wireless.getConnectedClients().done(function(wclients){
					clients.map(function(cl){
						var wcl = wclients.find(function(wc){ return String(wc.macaddr).toLowerCase() == String(cl.macaddr).toLowerCase(); }); 
						if(wcl) { 
							cl._display_widget = "wireless-client-lan-display-widget"; 
							cl._wireless = wcl; 
						}; 
					}); 
					def.resolve(); 
				}).fail(function(){
					def.reject(); 
				}); 
				return def.promise(); 
			}, 
			getDevices: function() {
				var deferred = $.Deferred(); 
				var devices = []; 
				$uci.$sync("wireless").done(function(result){
					// in wireless, wifi-iface is actually the layer2 device. Pretty huh? :-) 
					// oh, and network is what network the device belongs to. Even prettier. 
					$uci.wireless["@wifi-iface"].map(function(device){
						devices.push({
							get name() { return device.ssid.value; },
							get id() { return device.ifname.value; },
							get type() { return "wireless"; }, 
							base: device
						}); 
					}); 
					deferred.resolve(devices); 
				}); 
				return deferred.promise(); 
			}
		}
	}); 
}); 

JUCI.app.factory("$wireless", function($uci, $rpc, $network, gettext){
	
	function Wireless(){
		this.scheduleStatusText = gettext("off"); 
		this.wpsStatusText = gettext("off"); 
	}
	
	Wireless.prototype.annotateAdapters = function(adapters){
		var def = $.Deferred(); 
		var self = this; 
		self.getInterfaces().done(function(list){
			var devices = {}; 
			list.map(function(x){ devices[x.ifname.value] = x; }); 
			adapters.map(function(dev){
				if(dev.device in devices){
					dev.name = devices[dev.device].ssid.value + "@" + dev.device; 
					delete devices[dev.device]; 
				}
			});
			Object.keys(devices).map(function(k){
				var device = devices[k]; 
				adapters.push({
					name: device.ssid.value, 
					device: device.ifname.value, 
					type: "wireless", 
					state: "DOWN"
				}); 
			}); 
			def.resolve(); 
		}).fail(function(){
			def.reject(); 
		}); 
		return def.promise(); 
	}

	Wireless.prototype.getConnectedClients = function(){
		var def = $.Deferred(); 
		$rpc.juci.broadcom.wireless.clients().done(function(clients){
			if(clients && clients.clients) {
				clients.clients.map(function(cl){
					cl.snr = Math.floor(1 - (cl.rssi / cl.noise)); 
				}); 
				def.resolve(clients.clients); 
			}
			else def.reject(); 
		}); 
		return def.promise(); 
	}
	
	Wireless.prototype.getDevices = function(){
		var deferred = $.Deferred(); 
		$uci.$sync("wireless").done(function(){
			$uci.wireless["@wifi-device"].map(function(x){
				// TODO: this should be a uci "displayname" or something
				// TODO: actually this should be based on wireless ubus call field
				if(x.band.value == "a") x[".frequency"] = gettext("5GHz"); 
				else if(x.band.value == "b") x[".frequency"] = gettext("2.4GHz"); 
			}); 
			deferred.resolve($uci.wireless["@wifi-device"]); 
		}); 
		return deferred.promise(); 
	}
	
	Wireless.prototype.getInterfaces = function(){
		var deferred = $.Deferred(); 
		$uci.$sync("wireless").done(function(){
			var ifs = $uci.wireless["@wifi-iface"]; 
			var counters = {}; 
			// TODO: this is an ugly hack to automatically calculate wifi device name
			// it is not guaranteed to be exact and should be replaced by a change to 
			// how openwrt handles wireless device by adding an ifname field to wireless 
			// interface configuration which will be used to create the ethernet device.  
			ifs.map(function(i){
				if(i.ifname.value == ""){
					if(!counters[i.device.value]) counters[i.device.value] = 0; 
					if(counters[i.device.value] == 0)
						i.ifname.value = i.device.value; 
					else
						i.ifname.value = i.device.value + "." + counters[i.device.value]; 
					counters[i.device.value]++; 
				}
			}); 
			deferred.resolve(ifs); 
		}); 
		return deferred.promise(); 
	}
	
	Wireless.prototype.getDefaults = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.broadcom.wireless.defaults().done(function(result){
			if(!result) {
				deferred.reject(); 
				return; 
			}
			
			deferred.resolve(result); 
		}).fail(function(){
			deferred.reject(); 
		});  
		return deferred.promise(); 
	}
	
	Wireless.prototype.scan = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.broadcom.wld.scan().done(function(result){
			
		}).always(function(){
			deferred.resolve(); 
		});  
		return deferred.promise(); 
	}
	
	Wireless.prototype.getScanResults = function(){
		var deferred = $.Deferred(); 
		$rpc.juci.broadcom.wld.scanresults().done(function(result){
			deferred.resolve(result.list); 
		}); 
		return deferred.promise(); 
	}
	
	return new Wireless(); 
}); 

JUCI.app.run(function($ethernet, $wireless, $uci){
	$ethernet.addSubsystem($wireless); 
	// make sure we create status section if it does not exist. 
	$uci.$sync("wireless").done(function(){
		if(!$uci.wireless.status) {
			$uci.wireless.create({
				".type": "wifi-status", 
				".name": "status"
			}).done(function(){
				$uci.save();
			});  
		} 
		// remove the deprecated network field from all wireless configs
		$uci.wireless["@wifi-iface"].map(function(x){
			x.network.value = ""; 
		}); 
		$uci.$save(); 
	}); 
}); 

(function(){
	UCI.$registerConfig("wireless"); 
	UCI.wireless.$registerSectionType("wifi-status", {
		"wlan":		{ dvalue: true, type: Boolean }, 
		"wps":		{ dvalue: true, type: Boolean },
		"schedule":	{ dvalue: false, type: Boolean },
		"sched_status":	{ dvalue: false, type: Boolean }
	}); 
	UCI.wireless.$registerSectionType("wifi-schedule", {
		"days":		{ dvalue: [], type: Array, 
			allow: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], 
			alidator: UCI.validators.WeekDayListValidator},
		"time":		{ dvalue: "", type: String, validator: UCI.validators.TimespanValidator }
	}, function validator(section){
		if(section.days.value.length == 0){
			return gettext("please pick at least one day to schedule on"); 
		}
		return null; 
	}); 
	UCI.wireless.$registerSectionType("wifi-device", {
		"type": 			{ dvalue: "", type: String },
		"country": 		{ dvalue: "", type: String},
		"band": 			{ dvalue: "none", type: String, allow: [ "a", "b" ] },
		"bandwidth": 	{ dvalue: 0, type: String, allow: [ "20", "40", "80" ] },
		"channel":		{ dvalue: "auto", type: String, allow: [ "auto", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 36, 40, 44, 48 ] },
		"scantimer":	{ dvalue: 0, type: Number },
		"wmm":				{ dvalue: false, type: Boolean },
		"wmm_noack":	{ dvalue: false, type: Boolean },
		"wmm_apsd":		{ dvalue: false, type: Boolean },
		"txpower":		{ dvalue: 0, type: Number },
		"rateset":		{ dvalue: "default", type: String, allow: [ "default" ] },
		"frag":				{ dvalue: 0, type: Number },
		"rts":				{ dvalue: 0, type: Number },
		"dtim_period":{ dvalue: 0, type: Number },
		"beacon_int":	{ dvalue: 0, type: Number },
		"rxchainps":	{ dvalue: false, type: Boolean },
		"rxchainps_qt":{ dvalue: 0, type: Number },
		"rxchainps_pps":{ dvalue: 0, type: Number },
		"rifs":				{ dvalue: false, type: Boolean },
		"rifs_advert":{ dvalue: false, type: Boolean },
		"maxassoc":		{ dvalue: 0, type: Number },
		"doth":				{ dvalue: 0, type: Boolean },
		"dfsc":				{ dvalue: 0, type: Boolean }, // ? 
		"hwmode":			{ dvalue: "auto", type: String, allow: [ "auto", "11a", "11n", "11ac" ] },
		"disabled":		{ dvalue: false, type: Boolean }
	}); 
	UCI.wireless.$registerSectionType("wifi-iface", {
		"device": 		{ dvalue: "", type: String },
		"ifname": 		{ dvalue: "", type: String }, // name of the created device 
		"network":		{ dvalue: "", type: String },
		"mode":				{ dvalue: "ap", type: String, allow: [ "ap" ] },
		"ssid":				{ dvalue: "", type: String },
		"encryption":	{ dvalue: "mixed-psk", type: String, allow: [ "none", "wep", "wep-shared", "psk2", "mixed-psk", "wpa2", "mixed-wpa" ] },
		"cipher":			{ dvalue: "auto", type: String, allow: [ "auto" ] },
		"key":				{ dvalue: "", type: String },
		"key_index": 	{ dvalue: 1, type: Number }, 
		"key1":				{ dvalue: "1111111111", type: String },
		"key2":				{ dvalue: "2222222222", type: String },
		"key3":				{ dvalue: "3333333333", type: String },
		"key4":				{ dvalue: "4444444444", type: String },
		"radius_server":				{ dvalue: "", type: String },
		"radius_port":				{ dvalue: "", type: String },
		"radius_secret":				{ dvalue: "", type: String },
		"ifname":			{ dvalue: "", type: String },
		"gtk_rekey":	{ dvalue: false, type: Boolean },
		"net_rekey":	{ dvalue: 0, type: Number },
		"wps_pbc":		{ dvalue: false, type: Boolean },
		"wmf_bss_enable":{ dvalue: false, type: Boolean },
		"bss_max":		{ dvalue: 0, type: Number },
		"instance":		{ dvalue: 0, type: Number },
		"up":					{ dvalue: false, type: Boolean },
		"closed":			{ dvalue: false, type: Boolean },
		"disabled":		{ dvalue: false, type: Boolean },
		"macmode":		{ dvalue: 1, type: Number, allow: [ 0, 1, 2 ] },
		"macfilter":	{ dvalue: false, type: Boolean },
		"maclist":		{ dvalue: [], type: Array, match_each: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/ }
	}, function validator(section){
		// validate ssid
		if(section.ssid.value.length >= 32) 
			return gettext("SSID string can be at most 32 characters long!"); 
		// validate keys
		switch(section.encryption.value){
			case "wep": {
				for(var id = 1; id <= 4; id++){
					var key = section["key"+id]; 
					if(key && key.value != "" && !key.value.match(/[a-f0-9A-F]{10,26}/)) 
						return gettext("WEP encryption key #"+id+" must be 10-26 hexadecimal characters!"); 
				}
			} break;
			case "psk": 
			case "psk2": 
			case "mixed-psk": {
				if(!section.key.value || !(section.key.value.length >= 8 && section.key.value.length < 64))
					return gettext("WPA key must be 8-63 characters long!"); 
			} break; 
			default: 
				break; 
		}
		return null; 
	}); 
	
	
})(); 

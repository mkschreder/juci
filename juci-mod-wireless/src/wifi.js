/*JUCI.app
.config(function($stateProvider) {
	$stateProvider.state("wifi", {
		url: "/wifi", 
		onEnter: function($state){
			$juci.redirect("wifi-general"); 
		}
	}); 
}); */

JUCI.app.factory("$wireless", function($uci, $rpc, gettext){
	function Wireless(){
		this.scheduleStatusText = gettext("off"); 
		this.wpsStatusText = gettext("off"); 
	}
	
	Wireless.prototype.getInfo = function(){
		var deferred = $.Deferred(); 
		$rpc.router.info().done(function(result){
			var info = {
				wpa_key: result.keys.wpa
			}
			deferred.resolve(info); 
		}).fail(function(){
			deferred.reject(); 
		});  
		return deferred.promise(); 
	}
	/*JUCI.interval.repeat("wireless-refresh", 2000, function(done){
		refresh(done); 
	}); 
	function refresh(done) {
		$scope.wifiSchedStatus = gettext("off"); 
		$scope.wifiWPSStatus = gettext("off"); 
		async.series([
			function(next){
				$uci.sync(["wireless"]).done(function(){
					$scope.wifi = $uci.wireless;  
					if($uci.wireless && $uci.wireless.status) {
						$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
						$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
					}
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.router.clients().done(function(clients){
					var all = Object.keys(clients).map(function(x) { return clients[x]; }); 
					$scope.wireless.clients = all.filter(function(x){
						return x.connected && x.wireless == true; 
					}); 
					next(); 
				}).fail(function(){
					next();
				});; 
			},
		], function(){
			$scope.$apply(); 
			if(done) done(); 
		}); 
	} refresh(); */
	return new Wireless(); 
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
		"device": 		{ dvalue: "wl0", type: String },
		"network":		{ dvalue: "lan", type: String, allow: [ "lan", "guest" ] },
		"mode":				{ dvalue: "ap", type: String, allow: [ "ap" ] },
		"ssid":				{ dvalue: "Inteno", type: String },
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
				if(!section.key.value || !section.key.value.match(/[a-f0-9A-F]{10,26}/)) 
					return gettext("WEP encryption key must be 10-26 hexadecimal characters!"); 
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
	
	
	UCI.$registerConfig("hosts"); 
	UCI.hosts.$registerSectionType("host", {
		"hostname":		{ dvalue: "", type: String, required: true}, 
		"macaddr":		{ dvalue: "", type: String, match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, required: true}
	}); 
})(); 

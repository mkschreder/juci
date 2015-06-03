JUCI.app
.config(function($stateProvider) {
	$stateProvider.state("wifi", {
		url: "/wifi", 
		onEnter: function($state){
			$juci.redirect("wifi-general"); 
		}
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
		"days":		{ dvalue: [], type: Array, allow: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"], validator: UCI.validators.WeekDayListValidator},
		"time":		{ dvalue: "", type: String, validator: UCI.validators.TimespanValidator}
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
		"device": 		{ dvalue: "wl0", type: String, match: /^wl0|wl1$/ },
		"network":		{ dvalue: "lan", type: String, allow: [ "lan", "guest" ] },
		"mode":				{ dvalue: "ap", type: String, allow: [ "ap" ] },
		"ssid":				{ dvalue: "Inteno", type: String },
		"encryption":	{ dvalue: "mixed-psk", type: String, allow: [ "none", "wep", "psk", "psk2", "mixed-psk" ] },
		"cipher":			{ dvalue: "auto", type: String, allow: [ "auto" ] },
		"key":				{ dvalue: "", type: String },
		"ifname":			{ dvalue: "", type: String },
		"gtk_rekey":	{ dvalue: false, type: Boolean },
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
			throw new Error("SSID string can be at most 32 characters long!"); 
		// validate keys
		switch(section.encryption.value){
			case "wep": {
				if(!section.key.value || !section.key.value.match(/[a-f0-9A-F]{10,26}/)) 
					throw new Error("WEP encryption key must be 10-26 hexadecimal characters!"); 
			} break;
			case "psk": 
			case "psk2": 
			case "mixed-psk": {
				if(!section.key.value || !(section.key.value.length > 8 && section.key.value.length < 64))
					throw new Error("WPA key must be 8-63 characters long!"); 
			} break; 
			default: 
				break; 
		}
	}); 
	
	
	UCI.$registerConfig("hosts"); 
	UCI.hosts.$registerSectionType("host", {
		"hostname":		{ dvalue: "", type: String, required: true}, 
		"macaddr":		{ dvalue: "", type: String, match: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, required: true}
	}); 
})(); 

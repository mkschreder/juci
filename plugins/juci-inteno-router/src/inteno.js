JUCI.app
.factory("$router", function($uci){
	function IntenoRouter () {
		
	}
	
	IntenoRouter.prototype = {
		get wifi_button_wps_function_enabled(){
			if(!this.boardpanel) return false; 
			return this.boardpanel.settings.wifibutton.value; 
		}, 
		set wifi_button_wps_function_enabled(value){
			if(!this.boardpanel) return; 
			this.boardpanel.settings.wifibutton.value = value; 
		},
		
		get wifi_button_enabled(){
			if(!this.boardpanel) return false; 
			return this.boardpanel.settings.wifibutton.value; 
		},
		set wifi_button_enabled(value){
			if(!this.boardpanel) return; 
			this.boardpanel.settings.wifibutton.value = value; 
		},
		
		get wps_button_enabled(){
			if(!this.boardpanel) return false; 
			return this.boardpanel.settings.wpsbutton.value; 
		},
		set wps_button_enabled(value){
			if(!this.boardpanel) return false; 
			this.boardpanel.settings.wpsbutton.value = value;  
		}, 
	
		get wps_devicepin(){
			if(!this.boardpanel) return false; 
			return this.boardpanel.settings.wpsdevicepin.value; 
		},
		set wps_devicepin(value){
			if(!this.boardpanel) return ; 
			this.boardpanel.settings.wpsdevicepin.value = value; 
		}
	}; 
	
	var router = new IntenoRouter(); 
	
	router.sync = $uci.$sync("boardpanel"); 
	
	return router; 
}).run(function($router, $uci){
	$router.sync.done(function(){
		$router.boardpanel = $uci.boardpanel; 
		if(!$uci.boardpanel.settings){
			$uci.boardpanel.create({".type": "settings", ".name": "settings"}).done(function(section){
				$uci.save(); 
			}).fail(function(){
				//$scope.$emit("error", "Could not create required section boardpanel.settings in config!"); 
			}); 
		} 
	}); 
}); 

UCI.$registerConfig("boardpanel"); 
UCI.boardpanel.$registerSectionType("settings", {
	"usb_port": 		{ dvalue: true, type: Boolean }, 
	"status_led": 	{ dvalue: true, type: Boolean }, 
	"power_led": 		{ dvalue: true, type: Boolean }, 
	"power_led_br":	{ dvalue: 100, type: Number },
	"wifibutton": 	{ dvalue: true, type: Boolean },
	"wpsbutton": 		{ dvalue: true, type: Boolean },
	"wpsdevicepin": { dvalue: true, type: Boolean }
}); 
UCI.boardpanel.$registerSectionType("services", {
	"internet":				{ dvalue: "", type: String },
	"voice":					{ dvalue: "", type: String },
	"iptv":						{ dvalue: "", type: String },
	"ipv6":						{ dvalue: "", type: String }
}); 

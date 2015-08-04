JUCI.app
.factory("$router", function(){
	function IntenoRouter () {
		
	}
	
	IntenoRouter.__defineGetter__("wifi_button_wps_function_enabled", function(){
		if(!this.boardpanel) return false; 
		return this.boardpanel.settings.wifibutton.value; 
	}); 
	IntenoRouter.__defineSetter__("wifi_button_wps_function_enabled", function(value){
		if(!this.boardpanel) return; 
		this.boardpanel.settings.wifibutton.value = value; 
	}); 
	
	IntenoRouter.__defineGetter__("wifi_button_enabled", function(){
		if(!this.boardpanel) return false; 
		return this.boardpanel.settings.wifibutton.value; 
	}); 
	IntenoRouter.__defineSetter__("wifi_button_enabled", function(value){
		if(!this.boardpanel) return; 
		this.boardpanel.settings.wifibutton.value = value; 
	}); 
	
	IntenoRouter.__defineGetter__("wps_button_enabled", function(){
		if(!this.boardpanel) return false; 
		return this.boardpanel.settings.wpsbutton.value; 
	}); 
	IntenoRouter.__defineSetter__("wps_button_enabled", function(value){
		if(!this.boardpanel) return false; 
		this.boardpanel.settings.wpsbutton.value = value;  
	}); 
	
	IntenoRouter.__defineGetter__("wps_devicepin", function(){
		if(!this.boardpanel) return false; 
		return this.boardpanel.settings.wpsdevicepin.value; 
	}); 
	IntenoRouter.__defineGetter__("wps_devicepin", function(value){
		if(!this.boardpanel) return ; 
		this.boardpanel.settings.wpsdevicepin.value = value; 
	}); 
	
	return new IntenoRouter(); 
}).run(function($router, $uci){
	$uci.sync("boardpanel").done(function(){
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

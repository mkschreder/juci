//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

(function($juci){
	function JUCIConfig(){
		this.system = {}; 
		var defaults = {
			showlogin: true, 
			defaultuser: "admin", 
			wan_interface: "wan", 
			voice_interface: "wan", 
			iptv_interface: "wan"
		}; 
		Object.assign(this, defaults); 
	}
	JUCIConfig.prototype.$init = function(){
		var deferred = $.Deferred(); 
		var self = this; 
		console.log("Init CONFIG"); 

		async.series([
			function(next){
				UCI.$sync("boardpanel").done(function(){
					if(UCI.boardpanel && UCI.boardpanel.settings){
						var net = UCI.boardpanel.network; 
						if(net.internet.value) self["wan_interface"] = net.internet.value; 
						if(net.voice.value) self["voice_interface"] = net.voice.value; 
						if(net.iptv.value) self["iptv_interface"] = net.iptv.value; 
						if(net.ipv6.value) self["ipv6_interface"] = net.ipv6.value; 
					}
				}).always(function(){ next(); }); 
			}, function(next){
				// try loading hardware model from system display name
				// NOTE: this is redundant now. 
				/*UCI.$sync("system").done(function(){
					if(UCI.system){
						var system = UCI.system["@system"]; 
						if(system && system.length && system[0].displayname.value){
							self.hardware_model = system[0].displayname.value; 
						} 
					}
				}).always(function(){ next(); }); */
				next(); 
			}, function(next){
				if(self.hardware_model) { next(); return; }
				// try loading hardware model from the router info
				if(UBUS.router){
					UBUS.router.info().done(function(router){
						if(router.system)
							self.hardware_model = (router.system.name || "") + " " + (router.system.hardware || ""); 
					}).always(function(){ next(); }); 
				} else {
					next(); 
				}
			}, function(next){
				// load any remaining settings from juci config
				UCI.$sync("juci").done(function(){
					if(UCI.juci && UCI.juci.settings){
						console.log("Using settings from config/juci on router"); 
						Object.keys(UCI.juci.settings).map(function(k){
							var i = UCI.juci.settings[k]; 
							if(i.value !== undefined) self[k] = i.value; 
						}); 
						deferred.resolve(); 
					} else {
						$.get("/config.json", { format: "json" }).done(function(data){
							if(!data || data == undefined) throw new Error("Could not get config.json!"); 
							if(typeof data !== "object") {
								console.log("Data is not an object. Assuming json string.."); 
								try {
									data = JSON.parse(data); 
								} catch(e){
									console.error(e);
									deferred.reject(); 
									return;  
								}
							} 
							console.log("Using settings from config.json on router"); 
							Object.keys(data).map(function(k) { self[k] = data[k]; }); 
							deferred.resolve(); 
						}).fail(function(err){
							console.error("Could not parse config: "+JSON.stringify(err)); 
							deferred.reject(); 
						}); 
					}
				}); 
			}
		]); 
		
		return deferred.promise(); 
	}
	$juci.config = new JUCIConfig(); 
	
	JUCI.app.factory('$config', function(){
		return $juci.config; 
	}); 
})(JUCI); 

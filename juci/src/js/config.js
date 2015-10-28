//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

(function($juci){
	function JUCIConfig(){
		this.settings = {}; 
		this.system = {}; 
	}

	JUCIConfig.prototype.$init = function(){
		var deferred = $.Deferred(); 
		var self = this; 
		console.log("init: config"); 
			
		// $config.local points to local storage
		self.local = localStorage; 

		async.series([
			function(next){
				if(UBUS.system){
					UBUS.system.board().done(function(info){
						self.board = info; 
					}).always(function(){ next(); }); 
				} else {
					next(); 
				}
			}, function(next){
				// load systemwide settings from juci config
				UCI.$sync("juci").done(function(){
					if(UCI.juci){
						console.log("Using settings from config/juci on router"); 
						self.settings = UCI.juci; 
						deferred.resolve(); 
					} else {
						console.warning("Could not load juci config from router. It should exist by default. Please check that you have permissions to access it"); 
						deferred.reject(); 
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


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
		self.board = { system: {} }; 

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


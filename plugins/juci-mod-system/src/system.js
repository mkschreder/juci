//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

UCI.$registerConfig("system"); 

UCI.system.$registerSectionType("system", {
	"timezone":		{ dvalue: '', type: String },
	"zonename":		{ dvalue: '', type: String },
	"conloglevel":		{ dvalue: 0, type: Number },
	"cronloglevel":		{ dvalue: 0, type: Number },
	"hostname":		{ dvalue: '', type: String },
	"displayname":		{ dvalue: '', type: String },
	"log_size":		{ dvalue: 200, type: Number }
}); 

UCI.system.$registerSectionType("timeserver", {
	"enable_server": { dvalue: false, type: Boolean }, 
	"server": { dvalue: [], type: Array }
}); 

UCI.system.$registerSectionType("upgrade", {
	"fw_check_url":		{ dvalue: "", type: String, required: false},
	"fw_path_url":		{ dvalue: "", type: String },
	"fw_usb_path": 		{ dvalue: "", type: String }, 
	"fw_find_ext":		{ dvalue: "", type: String, required: false},
	"fw_upload_path":	{ dvalue: "", type: String, required: false}
}); 

JUCI.app.factory("$systemService", function($rpc){
	return {
		list: function(){
			var def = $.Deferred(); 
			var self = this; 
			$rpc.juci.system.service.list().done(function(result){
				if(result && result.services){
					var result = result.services.map(function(service){
						service.enable = function(){
							var self = this; 
							console.log("enabling service "+self.name); 
							return $rpc.juci.system.service.enable({ name: self.name }).done(function(){ self.enabled = true; }); 
						}
						service.disable = function(){
							var self = this; 
							console.log("disabling service "+self.name); 
							return $rpc.juci.system.service.disable({ name: self.name }).done(function(){ self.enabled = false; });
						}
						service.start = function(){
							var self = this; 
							console.log("starting service "+self.name); 
							return $rpc.juci.system.service.start({ name: self.name }).done(function(){ self.running = true; }); 
						}
						service.stop = function(){
							var self = this; 
							console.log("stopping service "+self.name); 
							return $rpc.juci.system.service.stop({ name: self.name }).done(function(){ self.running = false; }); 
						}
						service.reload = function(){
							var self = this; 
							return $rpc.juci.system.service.reload({ name: self.name }); 
						}
						return service;	
					}); 
					def.resolve(result); 
				} else {
					def.reject(); 
				}
			}).fail(function(){ def.reject(); }); 
			return def.promise(); 
		},
		find: function(name){
			var def = $.Deferred(); 
			this.list().done(function(services){
				if(services) {
					def.resolve(services.find(function(x){ return x.name == name; })); 
				} else {
					def.reject(); 
				}
			}).fail(function(){ def.reject(); }); 
			return def.promise(); 
		}
	}; 
}); 

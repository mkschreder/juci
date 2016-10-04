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

UCI.$registerConfig("system"); 

UCI.system.$registerSectionType("system", {
	"hostname":		{ dvalue: '', type: String },
	"timezone":		{ dvalue: '', type: String },
	"zonename":		{ dvalue: '', type: String },
	"conloglevel":		{ dvalue: 7, type: Number },
	"cronloglevel":		{ dvalue: 5, type: Number },
	"log_size":		{ dvalue: 16, type: Number },
	"log_file": 	{ dvalue: "", type: String },
	"log_ip": 		{ dvalue: "", type: String, validator: UCI.validators.IPAddressValidator },
	"log_port": 	{ dvalue: undefined, type: Number },
	"log_prefix": 	{ dvalue: "", type: String }, 
	"log_remote": 	{ dvalue: false, type: Boolean }
}, function(sec){
	if(sec.log_ip.value == "0.0.0.0") return gettext("Log IP is invalid"); 
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
					var s = services.find(function(x){ return x.name == name; }); 
					if(s)
						def.resolve(s); 
					else
						def.reject(); 
				} else {
					def.reject(); 
				}
			}).fail(function(){ def.reject(); }); 
			return def.promise(); 
		}
	}; 
}); 

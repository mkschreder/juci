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

JUCI.app.factory("$ethernet", function($rpc, $uci){
	function Ethernet() {
		this._adapters = []; 
		this._subsystems = []; 
	}

	Ethernet.prototype.addSubsystem = function(subsys){
		if(subsys) 
			this._subsystems.push(subsys); 
	} 
	
	Ethernet.prototype.getAdapters = function(){
		var def = $.Deferred(); 
		var self = this; 
		$rpc.juci.ethernet.adapters().done(function(result){
			if(result && result.adapters) {
				result.adapters.map(function(x){
					if(x.flags && x.flags.indexOf("UP") != -1) x.state = "UP"; 
					else x.state = "DOWN"; 
				}); 
				// pipe all adapters though all subsystems and annotate them
				async.each(self._subsystems, function(sys, next){
					if(sys.annotateAdapters && sys.annotateAdapters instanceof Function){
						sys.annotateAdapters(result.adapters).always(function(){
							next(); 
						});
					} else {
						next(); 
					}
				}, function(){ 
					def.resolve(result.adapters);
				}); 
			} else def.reject(); 
		}).fail(function(){ def.reject(); }); 	
		return def.promise(); 
	}

	return new Ethernet(); 
}); 

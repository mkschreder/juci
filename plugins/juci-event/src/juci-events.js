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

!function(){
	function EventManager(){
			this.callbacks = {};
	}
	EventManager.prototype.removeAll = function(){
		this.callbacks = {};
	}
	EventManager.prototype.subscribe = function(type, callback){
		if(!this.callbacks[type]) this.callbacks[type] = []; 
		this.callbacks[type].push(callback); 
	}
	JUCI.events = new EventManager();
	
	JUCI.app.run(function($rpc){
		var last_handled_time = 0;  
		var self = JUCI.events;
		setInterval(function(){
			if($rpc.juci == undefined || !$rpc.juci.event || !$rpc.juci.event.poll) return;  
			$rpc.juci.event.poll().done(function(result){
				var new_time = 0; 
				if(!result || !result.list) return; 
				result.list.map(function(event){
					if(event.time > last_handled_time){
						if(new_time < event.time) new_time = event.time;
						console.log("Event: "+JSON.stringify(event)); 
						var cb = self.callbacks[event.type]; 
						if(cb){
							cb.map(function(c){
								c.apply(event, [event]); 
							});  
							last_handled_time = event.time; 
						}
					}
				}); 
				last_handled_time = new_time; 
			}); 
		}, 5000);  
	}); 
	
	JUCI.app.factory("$events", function(){
		return JUCI.events; 
	}); 
	
}();
UCI.juci.$registerSectionType("juci_event", {
	"filter":	{ dvalue: [], type: Array }
});
UCI.juci.$insertDefaults("juci_event");

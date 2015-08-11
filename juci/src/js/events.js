!function(){
	function EventManager(){
			this.callbacks = {}; 
	}
	
	EventManager.prototype.subscribe = function(type, callback){
		if(!this.callbacks[type]) this.callbacks[type] = []; 
		this.callbacks[type].push(callback); 
	}
	JUCI.events = new EventManager();
	
	JUCI.app.run(function($rpc){
		var last_handled_time = new Date().getTime() / 1000; 
		var self = JUCI.events;
		if(!$rpc.juci.system || !$rpc.juci.system.events) return;  
		setInterval(function(){
			$rpc.juci.system.events().done(function(result){
				if(!result || !result.events) return; 
				result.events.map(function(event){
					if(event.time > last_handled_time){
						var cb = self.callbacks[event.type]; 
						if(cb){
							cb.map(function(c){
								c.apply(event, [event]); 
							});  
							last_handled_time = event.time; 
						}
					}
				}); 
			}); 
		}, 2000);  
	}); 
	
	JUCI.app.factory("$events", function(){
		return JUCI.events; 
	}); 
	
}();

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
						//console.log("Event: "+JSON.stringify(event)); 
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

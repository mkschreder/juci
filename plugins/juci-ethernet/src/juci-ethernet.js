//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.factory("$ethernet", function($rpc, $uci){
	function Ethernet() {
		this._adapters = []; 
		this._subsystems = []; 
	}

	Ethernet.prototype.addSubsystem(function(proc){
		if(!proc || !(proc instanceof Function)) throw new Error("Subsystem argument must be a function returning a subsystem object!"); 

		var subsys = proc(); 
		this._subsystems.push(subsys); 
	}); 
	
	Ethernet.prototype.getAdapters = function(){
		var def = $.Deferred(); 
		var self = this; 
		$rpc.juci.ethernet.adapters().done(function(result){
			if(result && result.adapters) {
				// pipe all adapters though all subsystems and annotate them
				async.each(self._subsystems, function(sys){
					if(sys.annotateAdapters && typeof sys.annotateAdapters == Function){
						sys.annotateAdapters(result.adapters).done(function(){
							next(); 
						});
					} else {
						next(); 
					}
				}, function(){ 
					def.resolve(result.adapters);
				}); 
			} else def.reject(); 
		}); 	
		return def.promise(); 
	}
}); 

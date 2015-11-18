//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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

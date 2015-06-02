(function(){
	var _timeouts = {}; 
	JUCI.interval = {
		once: function(t, fn){
			var i = setTimeout(function _onTimeout(){
				fn(function next(ret, err){
					clearTimeout(i); 
					delete _timeouts[name]; 
				}); 
			}, t); 
			_timeouts[name] = i; 
		}, 
		repeat: function(name, t, fn){
			function _onTimeout(){
				fn(function next(ret, err){
					if(!ret) {
						if(!_timeouts[name] || !_timeouts[name].cleared)
							_timeouts[name] = setTimeout(_onTimeout, t); 
					}
				}); 
			}
			//_timeouts[name] = setTimeout(_onTimeout, t); 
			_onTimeout(); 
		}, 
		$clearAll: function(){
			Object.keys(_timeouts).map(function(t){ 
				clearTimeout(_timeouts[t]); 
				_timeouts[t].cleared = true; 
			});
		} 
	}; 
})(); 

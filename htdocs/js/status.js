//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app.factory('$status', function($rpc) {
	var updates = {
		"router.info": 4000,
		"network.interface.wan": 1000
	}; 
	var ret = {}; 
	window.status = ret; 
	function getdata(obj, path){
		for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
				if(obj == undefined) return null; 
				obj = obj[path[i]];
		};
		return obj;
	}
	function putdata(obj, path, data){
		for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
			if(!obj.hasOwnProperty(path[i])) {
				obj[path[i]] = {}; 
			} 
			obj = obj[path[i]];
			if(i == (len - 1)){
				Object.keys(data).map(function(k){
					obj[k] = data[k]; 
				}); 
			}
		};
	}
	Object.keys(updates).map(function(item){
		var call = getdata($rpc, item); 
		if(call){
			(function(interval){
				setInterval(function(){
					call().done(function(data){
						putdata(ret, item, data); 
					}); 
				}, interval);
			})( updates[item]);  
			
			call().done(function(data){
				putdata(ret, item, data); 
			}); 
		} 
	}); 
	
	return {
		ubus: ret, 
		get: function(path){
			return getdata(ret, path); 
		}
	}; 
}); 

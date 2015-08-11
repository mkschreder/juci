JUCI.app
.factory("$usb", function($rpc){
	function USB(){
		
	}
	
	USB.prototype.getDevices = function(){
		var def = $.Deferred(); 
		$rpc.juci.usb.list().done(function(result){
			if(result && result.devices) def.resolve(result.devices); 
			else def.reject(); 
		}); 
		return def.promise(); 
	}
	
	return new USB(); 
}).run(function($events){	
	$events.subscribe("usb.device.add", function(event){
		console.log("USB Plugged in: "+JSON.stringify(event)); 
	});
});  


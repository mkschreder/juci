//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiMacFilterPageCtrl", function($scope, $uci, gettext){
	window.uci = $uci; 
	$scope.uci = $uci; 
	
	$uci.$sync(["wireless", "hosts"]).done(function(){
		$scope.interfaces = $uci.wireless['@wifi-iface'];
		
		// TODO: ================ this is a duplicate. It should be put elsewhere!
		$scope.devices = $uci.wireless["@wifi-device"].map(function(x){
			// TODO: this should be a uci "displayname" or something
			if(x.band.value == "a") x[".label"] = gettext("5GHz"); 
			else if(x.band.value == "b") x[".label"] = gettext("2.4GHz"); 
			return { label: x[".label"], value: x[".name"] };
		}); 
		$uci.wireless["@wifi-iface"].map(function(x){
			var dev = $uci.wireless[x.device.value]; 
			x[".frequency"] = dev[".label"]; 
		});  
		// ========================
		
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
}); 

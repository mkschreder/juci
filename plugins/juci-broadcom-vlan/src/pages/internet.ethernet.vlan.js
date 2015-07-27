//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("BCMVLANPage", function($scope, $uci, $network){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}
	$network.getDevices().done(function(devices){
		$scope.vlan_devices = devices.filter(function(dev){
			return dev.type == "vlan"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.$apply(); 
	}); 
}); 

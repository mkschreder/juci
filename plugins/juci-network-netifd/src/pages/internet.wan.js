//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetWANPage", function($scope, $uci, $network, $config){
	$scope.protocolTypes = [
		{ label: "Manual", value: "static" }, 
		{ label: "Automatic (DHCP)", value: "dhcp" }
	]; 
	
	$network.getWanNetworks().done(function(wans){
		$scope.wan_networks = []; 
		var wan = wans.find(function(x){ return x[".name"] == $config.wan_interface; }); 
		if(wan) $scope.wan_networks.push(wan); 
		$scope.conn = wan; 
		$scope.$apply(); 
	}); 
}); 

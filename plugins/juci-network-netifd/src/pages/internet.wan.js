//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetWANPage", function($scope, $uci, $network, $config, $firewall, $upnp){
	$scope.protocolTypes = [
		{ label: "Manual", value: "static" }, 
		{ label: "Automatic (DHCP)", value: "dhcp" }
	]; 
	$scope.data = {}; 
	
	$upnp.getConfig().done(function(config){
		$scope.upnp = config; 
	}); 
	$firewall.nat.isEnabled().done(function(enabled){
		$scope.data.nat_enabled = enabled; 
		$scope.$apply(); 
	}); 
	
	$network.getWanNetworks().done(function(wans){
		$scope.wan_networks = []; 
		var wan = wans.find(function(x){ return x[".name"] == $config.wan_interface; }); 
		if(wan) $scope.wan_networks.push(wan); 
		$scope.conn = wan; 
		$scope.$apply(); 
	}); 
	
	$scope.onEnableNAT = function(){
		$firewall.nat.enable($scope.data.nat_enabled); 
	}
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetWANPage", function($scope, $uci, $network, $config, $firewall, $upnp, $tr, gettext){
	$scope.protocolTypes = [
		{ label: $tr(gettext("Manual")), value: "static" }, 
		{ label: $tr(gettext("Automatic (DHCP)")), value: "dhcp" }
	]; 
	$scope.data = {}; 
	
	$upnp.getConfig().done(function(config){
		$scope.upnp = config;
		$scope.$apply();  
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

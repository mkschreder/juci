//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("UPNPMainPage", function($scope, $uci, $network, $firewall, $upnp, $tr, gettext){
	$upnp.getConfig().done(function(config){
		$scope.upnp = config;
		$scope.$apply();  
	}); 
}); 

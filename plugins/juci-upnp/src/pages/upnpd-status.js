//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("UPNPStatusPage", function($scope, $upnp){	
	$rpc.juci.upnpd.ports().done(function(result){
		$scope.upnpOpenPorts = result.ports; 
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
}); 

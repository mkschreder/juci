//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetLANPage", function($scope, $uci, $network, $config){
	$network.getLanNetworks().done(function(lans){
		$scope.lan_networks = lans.filter(function(x){ return x[".name"] != "loopback"; }); 
		
		$scope.$apply(); 
	}); 
}); 

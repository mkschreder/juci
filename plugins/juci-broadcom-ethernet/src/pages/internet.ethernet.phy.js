//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetEthernetPhysical", function($scope, $uci, $ethernet, gettext){
	$scope.data = {}; 
	$ethernet.getPorts().done(function(ports){
		$scope.ports = ports;
		$scope.data.wan_port = ports.find(function(x){ return x.is_wan_port; }); 
		
		$scope.$watch("data.wan_port", function(value){
			if(!value) return; 
			$ethernet.configureWANPort(value.id); 
		}); 
		
		$scope.$apply(); 
	}); 
}); 

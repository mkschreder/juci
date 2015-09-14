//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetEthernetPhysical", function($scope, $uci, $ethernet, gettext){
	$scope.data = {}; 
	$scope.getItemTitle = function(item) {
		if(!item) return "error";
		return item.name;
	}
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

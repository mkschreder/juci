//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("ServicesStatusPage", function($scope, $rpc, gettext){
	$rpc.juci.system.service.list().done(function(result){
		$scope.services = result.services; 
		$scope.$apply(); 
	}); 

	$scope.onServiceEnable = function(service){
	
	}
	
	$scope.onServiceReload = function(service){
	
	}

	$scope.onServiceToggle = function(service){

	}
}); 

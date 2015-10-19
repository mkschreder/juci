//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusNATPageCtrl", function($scope, $rpc, $tr, $network, gettext){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = ($scope.predicate === pred) ? !$scope.reverse : false;
	}

	$network.getNetworkLoad().done(function(load){
		$scope.load = load; 
		$scope.$apply(); 
	});
	
	$network.getNatTable().done(function(table){
		$scope.connections = table; 
		$scope.$apply(); 
	}); 
}); 

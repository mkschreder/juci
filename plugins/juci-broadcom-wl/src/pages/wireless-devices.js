//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("wirelessDevices", function($scope, $uci, $wireless){
	$wireless.getDevices().done(function(devices){
		$scope.devices = devices; 
		$scope.$apply(); 
	}); 
}); 

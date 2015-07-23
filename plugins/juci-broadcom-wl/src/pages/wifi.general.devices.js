//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiDevicesPage", function($scope, $uci, $wireless){
	$wireless.getDevices().done(function(devices){
		$scope.devices = devices; 
		$scope.$apply(); 
	}); 
}); 

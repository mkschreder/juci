//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("BCMDSLPage", function($scope, $uci, $dsl){
	$dsl.getDevices().done(function(devices){
		$scope.adsl_devices = devices.filter(function(dev){
			return dev.type == "adsl"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.vdsl_devices = devices.filter(function(dev){
			return dev.type == "vdsl"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.$apply(); 
	}); 
}); 

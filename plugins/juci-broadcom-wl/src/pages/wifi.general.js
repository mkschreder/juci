//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiGeneralPageCtrl", function($scope, $uci, $wireless, $router){
	$wireless.getInterfaces().done(function(ifaces){
		$wireless.getDevices().done(function(devs){
			$scope.interfaces = ifaces; 
			$scope.interfaces.map(function(i){
				i.$device = devs.find(function(x){ return x[".name"] == i.device.value; }); 
			}); 
			$scope.status = $uci.wireless.status; 
			$scope.router = $router; 
			$scope.$apply(); 
		}); 
	}); 
	// for automatically saving switch state
	$scope.onApply = function(){
		$uci.save(); 
	}
}); 

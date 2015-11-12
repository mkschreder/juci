//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("simple2GWirelessPage", function($scope, $uci, $config){
	$uci.$sync("wireless").done(function(){
		$scope.radio = $uci.wireless.r2g; 
		$scope.wifi_main = $uci.wireless.i2g; 
		$scope.wifi_guest = $uci.wireless.i2g_guest; 
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
}); 

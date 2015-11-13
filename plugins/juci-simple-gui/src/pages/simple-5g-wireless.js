//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("simple5GWirelessPage", function($scope, $uci){
	$uci.$sync("wireless").done(function(){
		$scope.radio = $uci.wireless.r5g; 
		$scope.wifi_main = $uci.wireless.i5g; 
		$scope.wifi_guest = $uci.wireless.i5g_guest; 
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
}); 

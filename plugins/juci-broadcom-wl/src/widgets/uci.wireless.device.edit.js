//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("uciWirelessDeviceEdit", function($compile){
	return {
		templateUrl: "/widgets/uci.wireless.device.edit.html", 
		scope: {
			device: "=ngModel"
		}, 
		controller: "WifiDeviceEditController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiDeviceEditController", function($scope, $rpc, $tr, gettext){
	$scope.$watch("device", function(device){
		if(!device) return; 
		
		$rpc.juci.wireless.radios().done(function(result){
			if(device[".name"] in result){
				var settings = result[device[".name"]]; 
				$scope.allChannels = [$tr(gettext("auto"))].concat(settings.channels).map(function(x){ return { label: x, value: x }; }); 
				$scope.allModes = [$tr(gettext("auto"))].concat(settings.hwmodes).map(function(x){ return { label: $tr(x), value: x }; }); ; 
				$scope.allBandwidths = settings.bwcaps.map(function(x){ return { label: x, value: x }; }); ; 
			} 
			$scope.$apply(); 
		}); 
	}); 
	
}); 

$juci.module("wifi")
.directive("uciWirelessDeviceEdit", function($compile){
	var plugin_root = $juci.module("wifi").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.wireless.device.edit.html", 
		scope: {
			device: "=ngModel"
		}, 
		controller: "WifiDeviceEditController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiDeviceEditController", function($scope, $rpc, gettext){
	$scope.$watch("device", function(device){
		if(!device) return; 
		
		$rpc.router.radios().done(function(result){
			if(device[".name"] in result){
				var settings = result[device[".name"]]; 
				$scope.allChannels = [gettext("auto")].concat(settings.channels); 
				$scope.allModes = settings.hwmodes; 
				$scope.allBandwidths = settings.bwcaps; 
			} else {
				$scope.allChannels = [ "auto"  ]; 
				$scope.allModes = ["802.11gn", "802.11bg", "802.11bgn", "802.11n"]; 
				$scope.allBandwidths = [ "20", "40", "80" ]; 
			}
			$scope.$apply(); 
		}); 
	}); 
	
}); 

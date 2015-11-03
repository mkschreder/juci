//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceWirelessEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-wireless-edit.html", 
		controller: "networkDeviceWirelessEdit", 
		replace: true
	};
})
.controller("networkDeviceWirelessEdit", function($scope){
	
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusUsbDevicesPage", function($scope, $uci, $usb){
	$usb.getDevices().done(function(devices){
		$scope.devices = devices; 
		$scope.$apply(); 
	}); 
}); 

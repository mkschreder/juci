//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewWidget40USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html", 
		controller: "overviewWidget40USB", 
		replace: true
	 };  
})
.controller("overviewWidget40USB", function($scope, $uci, $usb){
	$usb.getDevices().done(function(devices){
		$scope.devices = devices.filter(function(dev){ return dev.devicename && !dev.devicename.match(/root hub/); }); 
		$scope.$apply(); 
	}); 
}); 

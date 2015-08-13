//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewWidget40USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html", 
		controller: "overviewWidget40USB", 
		replace: true
	 };  
})
.directive("overviewStatusWidget40USB", function(){
	return {
		templateUrl: "widgets/overview.usb.small.html", 
		controller: "overviewWidget40USB", 
		replace: true
	 };  
})
.controller("overviewWidget40USB", function($scope, $uci, $usb){
	$usb.getDevices().done(function(devices){
		$scope.devices = devices.filter(function(dev){ return dev.product && !dev.product.match(/Host Controller/); }); 
		$scope.$apply(); 
	}); 
}); 

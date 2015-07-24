//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceAdslEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-adsl-edit.html", 
		controller: "networkDeviceAdslEdit", 
		replace: true
	 };  
})
.controller("networkDeviceAdslEdit", function($scope){
	$scope.$watch("device", function(value){
		if(!value) return; 
		$scope.conf = value.base || value; 
	}); 
}); 

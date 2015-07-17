//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceVdslEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-vdsl-edit.html", 
		controller: "networkDeviceVdslEdit", 
		replace: true
	};  
})
.controller("networkDeviceVdslEdit", function($scope){
	$scope.$watch("device", function(value){
		if(!value) return; 
		$scope.config = value.base; 
	}); 
}); 

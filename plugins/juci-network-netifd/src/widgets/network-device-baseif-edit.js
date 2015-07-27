//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceBaseifEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		},
		templateUrl: "/widgets/network-device-baseif-edit.html", 
		controller: "networkDeviceBaseifEdit", 
		replace: true
	 };  
})
.controller("networkDeviceBaseifEdit", function($scope){
	
}); 

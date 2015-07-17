//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceEthernetEdit", function($compile){
	return {
		templateUrl: "/widgets/network-device-ethernet-edit.html", 
		controller: "networkDeviceEthernetEdit", 
		replace: true
	 };  
})
.controller("networkDeviceEthernetEdit", function($scope){
	
}); 

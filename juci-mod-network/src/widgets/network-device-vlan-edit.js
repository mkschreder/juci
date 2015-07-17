//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceVlanEdit", function($compile){
	return {
		templateUrl: "/widgets/network-device-vlan-edit.html", 
		controller: "networkDeviceVlanEdit", 
		replace: true
	 };  
})
.controller("networkDeviceVlanEdit", function($scope){
	
}); 

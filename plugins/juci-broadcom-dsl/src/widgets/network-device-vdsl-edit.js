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
.controller("networkDeviceVdslEdit", function($scope, $network){
	$network.getDevices().done(function(devices){
		var baseDevices = []; 
		devices.map(function(device){
			if(device.id.match(/.*ptm.*/)) {
				var id = device.id.substr(0, device.id.lastIndexOf(".")); 
				baseDevices.push({
					label: id, 
					value: id
				});
			}
		}); 
		$scope.baseDevices = baseDevices; 
		$scope.$apply(); 
	}); 
	$scope.$watch("device", function(value){
		if(!value) return; 
		$scope.conf = value.base || value; 
	}); 
}); 

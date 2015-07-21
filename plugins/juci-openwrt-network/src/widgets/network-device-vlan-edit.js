//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceVlanEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-vlan-edit.html", 
		controller: "networkDeviceVlanEdit", 
		replace: true
	};  
})
.controller("networkDeviceVlanEdit", function($scope, $network){
	$scope.data = {
		device_id: "", 
		base_device: ""
	}; 
	$scope.$watch("device", function(value){
		if(!value) return; 
		var parts = value.base.ifname.value.split("."); 
		if(parts.length != 2) return; 
		$scope.data.device_id = parts[1]; 
		$scope.data.base_device = parts[0]; 
	}); 
	$scope.$watch("data.device_id", function(value){
		if(!$scope.device) return; 
		$scope.device.base.ifname.value = $scope.data.base_device+"."+value; 
	}); 
	$scope.$watch("data.base_device", function(value){
		if(!$scope.device) return; 
		$scope.device.base.ifname.value = value+"."+$scope.data.device_id; 
	}); 
	$network.getDevices().done(function(devs){
		$scope.baseDevices = devs
			.filter(function(x){ return x.type == "baseif" && x.name != "lo"; })
			.map(function(x){
				return { label: x.name, value: x.name }
			});
		$scope.$apply();  
	}); 
}); 

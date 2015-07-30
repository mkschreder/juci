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
		$scope.conf = value; 
		var parts = $scope.conf.ifname.value.split("."); 
		if(parts.length != 2) return; 
		$scope.data.device_id = parts[1]; 
		$scope.data.base_device = parts[0]; 
	}); 
	$scope.$watch("data.device_id", function(value){
		if(!$scope.conf) return; 
		$scope.conf.ifname.value = $scope.data.base_device+"."+value; 
	}); 
	$scope.$watch("data.base_device", function(value){
		if(!$scope.conf) return; 
		$scope.conf.ifname.value = value+"."+$scope.data.device_id; 
		$scope.conf.baseifname.value = value; 
	}); 
	$network.getDevices().done(function(devs){
		$scope.baseDevices = devs
			.filter(function(x){ return (x.type == "baseif" || x.type == "adsl" || x.type == "vdsl") && x.name != "loopback"; })
			.map(function(x){
				return { label: x.name, value: x.id }
			});
		$scope.$apply();  
	}); 
}); 

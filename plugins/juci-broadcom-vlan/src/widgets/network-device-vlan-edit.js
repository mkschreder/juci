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
	$scope.$watch("conf.vlan8021q.value", function(value){
		if(!$scope.conf) return; 
		$scope.conf.ifname.value = $scope.data.base_device+"."+value; 
	}); 
	$scope.$watch("data.base_device", function(value){
		if(!$scope.conf) return; 
		$scope.conf.ifname.value = value+"."+$scope.conf.vlan8021q.value; 
		$scope.conf.baseifname.value = value; 
	}); 
	$network.getDevices().done(function(devs){
		$scope.baseDevices = devs
			.filter(function(x){ return (x.type == "ethernet" || x.type == "adsl" || x.type == "vdsl") && x.name != "loopback"; })
			.map(function(x){
				var devid = x.id.substr(0, x.id.lastIndexOf(".")); 
				return { label: x.name, value: devid }
			});
		$scope.$apply();  
	}); 
}); 

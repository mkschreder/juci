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
.controller("networkDeviceVlanEdit", function($scope, $network, $uci){
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
	$uci.$sync(["layer2_interface_vdsl", "layer2_interface_adsl", "layer2_interface_ethernet"]).done(function(){
		var vdslDevs = $uci.layer2_interface_vdsl["@vdsl_interface"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		var adslDevs = $uci.layer2_interface_adsl["@atm_bridge"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		var ethDevs = $uci.layer2_interface_ethernet["@ethernet_interface"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		$scope.baseDevices = vdslDevs.concat(adslDevs).concat(ethDevs);
		$scope.$apply();
	});
}); 

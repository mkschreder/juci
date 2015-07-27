//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("BCMVLANPage", function($scope, $uci, $network, gettext){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}
	$network.getDevices().done(function(devices){
		$scope.vlan_devices = devices.filter(function(dev){
			return dev.type == "vlan"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.$apply(); 
	}); 
	
	
	$scope.onCreateDevice = function(){
		$uci.layer2_interface_vlan.create({
			".type": "vlan_interface",
			"name": gettext("New interface")
		}).done(function(interface){
			$scope.vlan_devices.push(interface); 
			$scope.$apply(); 
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device?"))){
			dev.$delete().done(function(){
				$scope.vlan_devices = $scope.vlan_devices.filter(function(d){
					return d != dev; 
				}); 
				$scope.$apply(); 
			}); 
		}
	}
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageBroadcomEthernetVlan", function($scope, $uci, $network, gettext){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}
	
	$uci.$sync("layer2_interface_vlan").done(function(){
		$scope.vlan_devices = $uci.layer2_interface_vlan["@vlan_interface"]; 
		$scope.$apply(); 
	}); 
	
	
	$scope.onCreateDevice = function(){
		$uci.layer2_interface_vlan.create({
			".type": "vlan_interface",
			"name": gettext("New interface")
		}).done(function(interface){
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

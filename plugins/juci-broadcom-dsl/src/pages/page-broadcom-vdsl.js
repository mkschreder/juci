//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageBroadcomVdsl", function($scope, $uci, $broadcomDsl, dslBaseDevicePicker){
	$scope.getItemTitle = function(dev){
		if(!dev) return "Unknown"; 
		return dev.name.value + " (" +dev.ifname.value + ")"; 
	}

	$broadcomDsl.getDevices().done(function(devices){
		$scope.vdsl_devices = devices.filter(function(dev){
			return dev.type == "vdsl"; 
		}).map(function(dev){
			return dev.base; 
		}); 
		$scope.$apply(); 
	}); 
	
	$scope.onCreateDevice = function(){
		var baseifname = "ptm"; 
		var next_id = 0; 
		// automatically pick an id for the new device
		for(var id = 1; id < 255; id++){ 
			if(!$uci.layer2_interface_vdsl["@vdsl_interface"].find(function(i){ return String(i.ifname.value).indexOf(baseifname + id) == 0; })){
				next_id = id; 
				break; 
			}
		}
		$uci.layer2_interface_vdsl.create({
			".type": "vdsl_interface",
			"name": gettext("New device"), 
			"ifname": baseifname + next_id + ".1", 
			"baseifname": baseifname + next_id
		}).done(function(interface){
			$scope.vdsl_devices.push(interface); 
			$scope.$apply(); 
		});
	}
	
	$scope.onDeleteDevice = function(dev){
		if(!dev) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device?"))){
			dev.$delete().done(function(){
				$scope.vdsl_devices = $scope.vdsl_devices.filter(function(d){
					return d != dev; 
				}); 
				$scope.$apply(); 
			}); 
		}
	}
}); 

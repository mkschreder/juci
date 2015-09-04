//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionTypeBridgeEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel", 
			doNotMarkBridgedDevices: "@"
		}, 
		templateUrl: "/widgets/network-connection-type-bridge-edit.html", 
		controller: "networkConnectionTypeBridgeEdit", 
		replace: true
	 };  
})
.controller("networkConnectionTypeBridgeEdit", function($scope, $network, $modal, $tr, gettext){
	$scope.getItemTitle = function(dev){
		return dev.name; // + " ("+dev.id+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$network.getAdapters().done(function(devs){
			var devlist = (net.ifname.value != "")?net.ifname.value.split(" "):[]; 
			var addable = []; 
			net.$addedDevices = devlist.map(function(dev){
				return { name: dev }; 
			}); 
			devs.map(function(dev){
				var is_added = devlist.find(function(x){ return x == dev.name; }); 
				// filter out already bridged devices and ones that have already been added.
				if(is_added) return; 
				addable.push({ label: dev.name, value: dev.name }); 
			}); 
			net.$addableDevices = addable; 
			$scope.$apply(); 
		}); 
	}; updateDevices($scope.connection); 
	
	$scope.$watch("connection", function(value){
		if(!value) return; 
		updateDevices(value); 
		
	});
	
	
	$scope.onAddBridgeDevice = function(){
		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'widgets/bridge-device-picker.html',
			controller: 'bridgeDevicePicker',
			resolve: {
				devices: function () {
					return $scope.connection.$addableDevices;
				}
			}
		});

		modalInstance.result.then(function (data) {
			console.log("Added device: "+JSON.stringify(data)); 
			var keep_device = false; 
			// remove the device from any other interface that may be using it right now (important!); 
			$network.getNetworks().done(function(nets){
				$network.getDevices().done(function(devs){
					nets.filter(function(net){ return net.type.value == "bridge" || net.type.value == "anywan"; }).map(function(net){
						net.ifname.value = net.ifname.value.split(" ").filter(function(dev){ 
							if(dev == data && !confirm($tr(gettext("Are you sure you want to remove device "+dev+" from network "+net['.name']+" and use it in this bridge?")))) {
								keep_device = true; 
								return true; 
							}
							else if(dev == data) return false; 
							return true; 
						}).join(" ");
					}); 
					
					if(keep_device) return; 
					
					$scope.connection.ifname.value += " " + data; 
					$scope.connection.ifname.value.split(" ").map(function(dev_name){
						var dev = devs.find(function(d){ return d.id == dev_name; }); 
						
						if(!$scope.doNotMarkBridgedDevices){
							// mark devies that are part of the bridge as bridged
							if(dev) dev.bridged = true; 
						}
					}); 
					updateDevices($scope.connection);
				}); 
			}); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteBridgeDevice = function(conn){
		if(!conn) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device from bridge?"))){
			$scope.connection.ifname.value = $scope.connection.ifname.value.split(" ").filter(function(name){
				return name != conn.name; 
			}).join(" "); 
			updateDevices($scope.connection); 
		}
	}
	
}); 

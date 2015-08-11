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
		return dev.name + " ("+dev.id+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$network.getNetworks().done(function(nets){
			$scope.nets = nets; 
			$network.getDevices().done(function(devs){
				$scope.devs = devs; 
				net.$addedDevices = []; 
				var addedDevices = net.ifname.value.split(" "); 
				net.$addableDevices = devs.filter(function(dev){ 
					var already_added = addedDevices.find(function(x){ 
						return x == dev.id; 
					}); 
					if(!already_added){
						return true; 
					} else {
						net.$addedDevices.push( dev ); 
						return false; 
					}
				}).map(function(dev){ 
					return { label: dev.name + " ("+dev.id+")", value: dev.id }; 
				}); 
				// update the value of the name list to the devices that we have actually been able to find
				net.ifname.value = net.$addedDevices.map(function(dev){ return dev.id }).join(" "); 
				$scope.$apply(); 
			}); 
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
			$scope.nets.map(function(net){
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
				var dev = $scope.devs.find(function(d){ return d.id == dev_name; }); 
				
				if(!$scope.doNotMarkBridgedDevices){
					// mark devies that are part of the bridge as bridged
					if(dev) dev.bridged = true; 
				}
			}); 
			updateDevices($scope.connection); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteBridgeDevice = function(conn){
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device from bridge?"))){
			$scope.connection.ifname.value = $scope.connection.ifname.value.split(" ").filter(function(name){
				return name != conn.id; 
			}).join(" "); 
			updateDevices($scope.connection); 
		}
	}
	
}); 

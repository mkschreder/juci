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
.controller("networkConnectionTypeBridgeEdit", function($scope, $network, $ethernet, $modal, $tr, gettext){
	$scope.getItemTitle = function(dev){
		return dev.name + " ("+dev.device+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$ethernet.getAdapters().done(function(adapters){
			var aptmap = {}; 
			adapters.map(function(x){ aptmap[x.device] = x; }); 
			net.$addedDevices = ((net.ifname.value != "")?net.ifname.value.split(" "):[])
				.filter(function(x){return x && x != ""; })
				.map(function(x){ 
					var a = aptmap[x];
					delete aptmap[x]; 
					return { name: a.name, device: a.device, adapter: a }; 
				}); 
			net.$addableDevices = Object.keys(aptmap).map(function(k){ return aptmap[k]; }); 
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
					return $scope.connection.$addableDevices.map(function(x){
						return { label: x.name, value: x.device };
					}); 
				}
			}
		});

		modalInstance.result.then(function (device) {
			console.log("Added device: "+JSON.stringify(device)); 
			var keep_device = false; 
			// remove the device from any other interface that may be using it right now (important!); 
			$network.getNetworks().done(function(nets){
				$ethernet.getAdapters().done(function(adapters){
					nets.filter(function(net){ return net.type.value == "bridge" || net.type.value == "anywan"; }).map(function(net){
						net.ifname.value = net.ifname.value.split(" ").filter(function(dev){ 
							if(dev == device && !confirm($tr(gettext("Are you sure you want to remove device "+dev+" from network "+net['.name']+" and use it in this bridge?")))) {
								keep_device = true; 
								return true; 
							}
							else if(dev == device) return false; 
							return true; 
						}).join(" ");
					}); 
					
					if(keep_device) return; 
					
					$scope.connection.ifname.value += " " + device; 
					$scope.connection.ifname.value.split(" ")
						.filter(function(x){ return x != ""; })
						.map(function(dev_name){
							var dev = adapters.find(function(d){ return d.device == dev_name; }); 
							
							if(!$scope.doNotMarkBridgedDevices){
								// mark devies that are part of the bridge as bridged
								//if(dev) dev.bridged = true; 
								// TODO: this is removed for now. 
							}
						}); 
					updateDevices($scope.connection);
				}); 
			}); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteBridgeDevice = function(adapter){
		if(!adapter) alert(gettext("Please select a device in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this device from bridge?"))){
			$scope.connection.ifname.value = $scope.connection.ifname.value.split(" ").filter(function(name){
				return name != adapter.device; 
			}).join(" "); 
			updateDevices($scope.connection); 
		}
	}
	
}); 

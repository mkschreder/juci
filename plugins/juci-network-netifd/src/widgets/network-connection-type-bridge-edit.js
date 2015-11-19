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
	// expose tab title 
	gettext("network.interface.type.bridge.tab.title"); 
	
	$scope.getItemTitle = function(dev){
		return dev.name + " ("+dev.device+")"; 
	}

	var sync = $ethernet.getAdapters(); 
	
	function updateDevices(){
		if(!$scope.connection) return; 
		var net = $scope.connection; 
		sync.done(function(adapters){
			var aptmap = {}; 
			adapters.map(function(x){ aptmap[x.device] = x; }); 
			$scope.addedDevices = ((net.ifname.value != "")?net.ifname.value.split(" "):[])
				.filter(function(x){return x && x != "" && aptmap[x]; })
				.map(function(x){ 
					// return device and delete it from map so the only ones left are the ones that can be added
					var a = aptmap[x];
					delete aptmap[x]; 
					return a; 
				}); 
			$scope.addableDevices = Object.keys(aptmap).map(function(k){ return aptmap[k]; }); 
			setTimeout(function(){ $scope.$apply(); }, 0);  
		}); 
	}; updateDevices(); 
	
	$scope.$watch("connection", function(value){
		if(!value) return; 
		updateDevices(value); 	
	});

	$scope.$watch("addedDevices", function(value){
		if(!value) return; 
		$scope.connection.ifname.value = value.map(function(x){
			return x.device; 
		}).join(" "); 
		// get networks
		/*$network.getNetworks().done(function(nets){
			// get adapters
			sync.done(function(adapters){
				// for each newly added device, check if it is already added somewhere else 
				value.forEach(function(addedDev){
					// only use bridge or anywan nets
					nets.filter(function(net){ return net.type.value == "bridge" || net.type.value == "anywan"; }).map(function(net){
						net.ifname.value = net.ifname.value.split(" ").filter(function(dev){ 
							if(dev == addedDev.device && !confirm($tr(gettext("Are you sure you want to remove device "+dev+" from network "+net['.name']+" and use it in this bridge?")))) {
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
						.filter(function(x){ return x != ""; }); 
				}); 
			}); 
		});*/ 
	}, true); 

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

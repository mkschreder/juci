//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionTypeBridgeEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-bridge-edit.html", 
		controller: "networkConnectionTypeBridgeEdit", 
		replace: true
	 };  
})
.controller("networkConnectionTypeBridgeEdit", function($scope, $network, $modal){
	$scope.getItemTitle = function(dev){
		return dev.name + " ("+dev.id+")"; 
	}
	function updateDevices(net){
		if(!net) return;
		$network.getDevices().done(function(devs){
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
			$scope.connection.ifname.value += " " + data; 
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

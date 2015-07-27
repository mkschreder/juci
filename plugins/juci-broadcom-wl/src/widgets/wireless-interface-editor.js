//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("wirelessInterfaceEditor", function($compile, $parse){
	var plugin_root = $juci.module("wifi").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/wireless-interface-editor.html", 
		controller: "wirelessInterfaceEditor", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("wirelessInterfaceEditor", function($scope, $uci, $wireless, gettext, prompt, $modal){
	$wireless.getInterfaces().done(function(interfaces){
		$wireless.getDevices().done(function(devices){
			$scope.devices = devices; 
			$scope.interfaces = interfaces; 
			$scope.interfaces.map(function(x){
				var dev = devices.find(function(dev) { return dev[".name"] == x.device.value; }); 
				x[".frequency"] = (dev||{})[".frequency"]; 
			}); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.getItemTitle = function($item){
		return ($item.ssid.value + ' (' + $item[".frequency"] + ')'); 
	}
	
	$scope.onCreateInterface = function(){
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'widgets/wifi-radio-picker-modal.html',
			controller: 'WifiRadioPickerModal',
			resolve: {
				interfaces: function () {
					return $scope.interfaces;
				}
			}
		});

		modalInstance.result.then(function (data) {
			$uci.wireless.create({
				".type": "wifi-iface",
				"device": data.radio, 
				"ssid": data.ssid
			}).done(function(interface){
				//$scope.interfaces.push(interface); 
				interface[".frequency"] = ($scope.devices.find(function(x){ return x[".name"] == interface.device.value; })||{})[".frequency"]; 
				$scope.$apply(); 
			}); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
		/*
		prompt({
			"title": gettext("New Wireless Interface"),
			"message": gettext("Enter SSID for your new interface:"),
			"input": true,
			"buttons": [
				{
					"label": gettext("Cancel"),
					"cancel": true,
					"primary": true
				},
				{
					"label": gettext("OK"),
					"cancel": false, 
					"primary": true
				}
			]
		}).then(function(result){
			if(!result || result == ""){
				alert(gettext("SSID can not be empty!")); 
				return; 
			}
			if(($scope.interfaces.find(function(x){ return x.ssid.value == result && x.device; }) && confirm(gettext("Are you sure you want to create a new SSID with the same name and on the same radio?"))))
			$uci.network.create({
				".type": "interface",
				".name": result
			}).done(function(interface){
				$scope.current_connection = interface; 
				$scope.networks.push(interface); 
				$scope.$apply(); 
			}); 
		});*/
	}
	
	$scope.onDeleteInterface = function(conn){
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this wireless interface?"))){
			conn.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
	$scope.onEditConnection = function(conn){
		// set editing widget for the type specific part of the conneciton wizard
		$rpc.network.interface.dump().done(function(ifaces){
			var info = ifaces.interface.find(function(x){ return x.interface == conn[".name"]; }); 
			$scope.current_connection = conn; 
			conn.$type_editor = "<network-connection-proto-"+conn.type.value+"-edit ng-model='current_connection'/>"; 
			conn.$info = info; 
			$scope.$apply(); 
		}); 
	}
}); 

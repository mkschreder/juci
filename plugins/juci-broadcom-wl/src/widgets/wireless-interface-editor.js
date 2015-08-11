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
			var devcounter = {}; 
			$scope.interfaces.map(function(x){
				var dev = devices.find(function(dev) { return dev[".name"] == x.device.value; }); 
				x[".frequency"] = (dev||{})[".frequency"]; 
				// TODO: this is a workaround for automatically setting ifname. It should be reworked so that ifname is actually set to the value of ifname in the broadcom wifi script!
				var devid = ""; 
				var devname = dev[".name"]; 
				if(!devcounter[devname]) devcounter[devname] = 1; 
				else devid = devcounter[devname]++; 
				x.ifname.value = devname+((devid)?("."+devid):""); 
			}); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.getItemTitle = function($item){
		return ($item.ssid.value + ' @ ' + $item.ifname.value + ' (' + $item[".frequency"] + ')'); 
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
	}
	
	$scope.onDeleteInterface = function(conn){
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this wireless interface?"))){
			conn.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 

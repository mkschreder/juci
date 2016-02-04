//! Author: Martin K Schreder <mkschreder@gmail.com>
//! Edit by: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("wirelessInterfacesPage", function($scope, $uci, $wireless, $tr, gettext, prompt, $modal){
	$wireless.getInterfaces().done(function(interfaces){
		$wireless.getDevices().done(function(devices){
			$scope.devices = devices; 
			$scope.interfaces = interfaces; 
			var devcounter = {}; 
			$scope.interfaces.map(function(x){
				var dev = devices.find(function(dev) { return dev[".name"] == x.device.value; });  
				if(dev){
					x[".frequency"] = dev[".frequency"]; 
				}
			}); 
			$scope.$apply(); 
		}); 
	}); 

	$scope.getItemTitle = function($item){
		return ($item.ssid.value + ' @ ' + $item.ifname.value + ' (' + $item[".frequency"] + ')'); 
	}

	$scope.onCreateInterface = function(){
		var numb = {};
		$scope.devices.map(function(dev){ return numb[dev[".frequency"]] = 0; });
		$scope.interfaces.map(function(iface){ numb[iface[".frequency"]] ++; });
		console.log(Object.keys(numb).filter(function(freq){ return numb[freq] < 4; }).length == 0);
		if(Object.keys(numb).filter(function(freq){ return numb[freq] < 4; }).length == 0){
			alert($tr(gettext("No more Wireless Interface spaces left. There can't be more then 4 Interfaces on each radio")));
			return;
		}
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
			$uci.wireless.$create({
				".type": "wifi-iface",
				"device": data.radio, 
				//"mode": data.mode,
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

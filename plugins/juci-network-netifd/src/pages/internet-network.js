//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetNetworkPage", function($scope, $uci, $rpc, $network, $config, gettext, networkConnectionCreate){
	$scope.data = {}; 
	
	$network.getDevices().done(function(devices){
		$scope.devices = devices; 
		
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ 
				if(x.defaultroute.value) $scope.data.wan_network = x; 
				return x.ifname.value != "lo" 
			}); 
			/*$scope.$watch("data.wan_network", function(value){
				if(!value) return; 
				$scope.networks.map(function(x){ x.defaultroute.value = false; }); 
				if(value.defaultroute) value.defaultroute.value = true; 
			}); */
			$scope.$apply(); 
			$network.getDevices().done(function(devs){
				$scope.networks = $scope.networks.map(function(net){ 
					net.addedDevices = []; 
					var addedDevices = net.ifname.value.split(" "); 
					//net.$type_editor = "<network-connection-proto-"+net.type.value+"-edit/>";
					net.addableDevices = devs
						.filter(function(dev){ 
							var already_added = addedDevices.find(function(x){ 
								return x == dev.id; 
							}); 
							if(!already_added){
								return true; 
							} else {
								net.addedDevices.push( { label: dev.name, value: dev.id }); 
								return false; 
							}
						})
						.map(function(dev){ 
							return { label: dev.name, value: dev.id }; 
						}); 
					return net; 
				}); 
				$scope.$apply(); 
			});
		}); 
	}); 
	
	$scope.onGetItemTitle = function(i){
		return i[".name"]; 
	}
	
	$scope.onAddConnection = function(){
		networkConnectionCreate.show().done(function(data){
			$uci.network.create({
				".type": "interface",
				".name": data.name, 
				"type": data.type
			}).done(function(interface){
				$scope.current_connection = interface; 
				$scope.networks.push(interface); 
				$scope.$apply(); 
			}); 
		});
	}
	
	$scope.onDeleteConnection = function(conn){
		if(!conn) alert($tr(gettext("Please select a connection in the list!"))); 
		if(confirm($tr(gettext("Are you sure you want to delete this connection?")))){
			conn.$delete().done(function(){
				$scope.networks = $scope.networks.filter(function(net){
					return net[".name"] != conn[".name"]; 
				}); 
				$scope.current_connection = null; 
				$scope.$apply(); 
			}); 
		}
	}
	
	$scope.onEditConnection = function(conn){
		// set editing widget for the type specific part of the conneciton wizard
		$scope.current_connection = conn; 
		
	}
	
	$scope.onCancelEdit = function(){
		$scope.current_connection = null; 
	}
	
	$scope.onAddDevice = function(net, dev){
		if(!dev) return; 
		var devs = {}; 
		net.ifname.value.split(" ").map(function(name){ devs[name] = name; }); 
		devs[dev] = dev; 
		net.ifname.value = Object.keys(devs).join(" "); 
		net.addedDevices = Object.keys(devs).map(function(x){ return { label: x, value: x }; }); 
	}
	
	$scope.onRemoveDevice = function(net, name){
		console.log("removing device "+name+" from "+net.ifname.value); 
		var items = net.ifname.value.split(" ").filter(function(x){ return x != name; }); 
		net.addedDevices = items.map(function(x){ return {label: x, value: x}; }); 
		net.ifname.value = items.join(" "); 
	}
	
}); 

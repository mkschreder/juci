//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetNetworkPage", function($scope, $uci, $rpc, $network, $config, gettext, prompt){
	$network.getDevices().done(function(devices){
		$scope.devices = devices; 
		
		$scope.networkTypes = [
			{ label: "Bridge", value: "bridge" }, 
			{ label: "AnyWAN", value: "anywan" }
		]; 
		$scope.protocolTypes = [
			{ label: "Manual", value: "static" }, 
			{ label: "Automatic (DHCP)", value: "dhcp" }
		]; 
			
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ return x.ifname.value != "lo" }); 
			$scope.$apply(); 
			$network.getDevices().done(function(devs){
				$scope.networks = $scope.networks.map(function(net){ 
					net.addedDevices = []; 
					var addedDevices = net.ifname.value.split(" "); 
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
		prompt({
			"title": gettext("New connection"),
			"message": gettext("Enter ID for new connection (you can NOT change this later!):"),
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
				alert(gettext("Name can not be empty!")); 
				return; 
			}
			console.log("RES: "+result); 
			$uci.network.create({
				".type": "interface",
				".name": result
			}).done(function(interface){
				$scope.current_connection = interface; 
				$scope.networks.push(interface); 
				$scope.$apply(); 
			}); 
		});
	}
	
	$scope.onDeleteConnection = function(conn){
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this connection?"))){
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
		$rpc.network.interface.dump().done(function(ifaces){
			var info = ifaces.interface.find(function(x){ return x.interface == conn[".name"]; }); 
			$scope.current_connection = conn; 
			conn.$type_editor = "<network-connection-proto-"+conn.type.value+"-edit ng-model='current_connection'/>"; 
			conn.$info = info; 
			$scope.$apply(); 
		}); 
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

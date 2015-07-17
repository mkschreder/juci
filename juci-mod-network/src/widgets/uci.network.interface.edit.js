JUCI.app
.directive("uciNetworkInterfaceEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.network.interface.edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "uciNetworkInterfaceEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("uciNetworkInterfaceEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.$watch("interface", function(iface){
		if(!iface) return; 
		$network.getDevices().done(function(devs){
			var addedDevices = $scope.interface.ifname.value.split(" "); 
			$scope.addableDevices = devs
				.filter(function(dev){ 
					return !addedDevices.find(function(x){ 
						return x == dev.name; 
					}); 
				})
				.map(function(dev){ 
					return { label: dev.name, value: dev.name }; 
				}); 
			$scope.$apply(); 
		});
		$rpc.router.clients().done(function(clients){
			$uci.sync("dhcp").done(function(){
				if($scope.interface.devices && $scope.interface.devices instanceof Array)
					$scope.phyInterfaces = $scope.interface.devices.map(function(x){ return { label: x.name, value: x.name }; }); 
				$scope.bridgedInterfaces = ($scope.phyInterfaces||[]).map(function(x){ return x.value; }); 
				if(iface[".name"] in $uci.dhcp){
					$scope.dhcp = $uci.dhcp[iface[".name"]]; 
					$scope.staticDHCP = $uci.dhcp["@host"]; 
					$scope.hosts = Object.keys(clients).filter(function(k){
						// filter out only clients that are connected to this network
						return clients[k].network == iface['.name'] && clients[k].connected; 
					}).map(function(k){
						return {
							label: clients[k].hostname || clients[k].ipaddr, 
							value: clients[k]
						}; 
					}); 
					$scope.$apply(); 
				} else {
					delete $scope["dhcp"]; 
					$scope.$apply(); 
				}
				
			}); 
		}); 
	}); 
	
	$scope.$watchCollection("bridgedInterfaces", function(value){
		if(!value || !$scope.interface || !(value instanceof Array)) return; 
		$scope.interface.ifname.value = value.join(" "); 
	}); 
	
	$scope.dhcpLeaseTimes = [
		{ label: "1 "+gettext("Hour"), value: "1h" }, 
		{ label: "6 "+gettext("Hours"), value: "6h" }, 
		{ label: "12 "+gettext("Hours"), value: "12h" }, 
		{ label: "24 "+gettext("Hours"), value: "24h" }, 
		{ label: gettext("Forever"), value: "24h" } // TODO: implement this on server side
	];  
	
	$scope.onAddDevice = function(dev){
		if(!dev) return; 
		var devs = {}; 
		$scope.interface.ifname.value.split(" ").map(function(name){ devs[name] = name; }); 
		devs[dev] = dev; 
		$scope.interface.ifname.value = Object.keys(devs).join(" "); 
		$scope.phyInterfaces = Object.keys(devs).map(function(x){ return { label: x, value: x }; }); 
	}
	
	$scope.onRemoveDevice = function(name){
		console.log("removing device "+name+" from "+$scope.interface.ifname.value); 
		var items = $scope.interface.ifname.value.split(" ").filter(function(x){ return x != name; }); 
		$scope.phyInterfaces = items.map(function(x){ return {label: x, value: x}; }); 
		$scope.interface.ifname.value = items.join(" "); 
	}
	
	$scope.onAddStaticDHCP = function(){
		var interface = "lan"; 
		if($scope.interface) interface = $scope.interface[".name"]; 
		$uci.dhcp.create({
			".type": "host", 
			"network": interface
		}).done(function(section){
			console.log("Added new dhcp section"); 
			$scope.$apply(); 
		}).fail(function(err){
			console.error("Failed to add new static dhcp entry: "+err); 
		}); 
	}
	$scope.onRemoveStaticDHCP = function(host){
		if(!host) return; 
		host.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	$scope.onAddExistingHost = function(){
		var item = $scope.existingHost; 
		$uci.dhcp.create({
			".type": "host", 
			name: item.hostname, 
			network: $scope.interface['.name'], 
			mac: item.macaddr, 
			ip: item.ipaddr
		}).done(function(section){
			console.log("Added static dhcp: "+JSON.stringify(item)); 
			$scope.$apply(); 
		}); 
	}
}); 

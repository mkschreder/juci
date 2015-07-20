JUCI.app
.controller("InternetNetworkPage", function($scope, $uci, $network, $config){
	$network.getDevices().done(function(devices){
		$scope.devices = devices; 
		
		$scope.networkTypes = [
			{ label: "Local", value: "lo" }, 
			{ label: "Bridge", value: "bridge" }, 
			{ label: "AnyWAN", value: "anywan" }
		]; 
		$scope.protocolTypes = [
			{ label: "Static", value: "static" }, 
			{ label: "DHCP", value: "dhcp" }, 
			{ label: "DHCP6", value: "dhcp6" }
		]; 
			
		$network.getNetworks().done(function(nets){
			$network.getDevices().done(function(devs){
				$scope.networks = nets
				.filter(function(x){ return x.ifname.value != "lo" })
				.map(function(net){ 
					net.addedDevices = []; 
					var addedDevices = net.ifname.value.split(" "); 
					net.addableDevices = devs
						.filter(function(dev){ 
							var already_added = addedDevices.find(function(x){ 
								return x == dev.name; 
							}); 
							if(!already_added){
								return true; 
							} else {
								net.addedDevices.push( { label: dev.name, value: dev.name }); 
								return false; 
							}
						})
						.map(function(dev){ 
							return { label: dev.name, value: dev.name }; 
						}); 
					return net; 
				}); 
				$scope.$apply(); 
			});
			
		}); 
	}); 
	
	
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

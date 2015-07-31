//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("DDNSPage", function ($scope, $uci, $network, $config) {
	
	$scope.data = {}; 
	$uci.sync(["ddns"]).done(function () {
		$network.getWanNetworks().done(function(nets){
			// get the wan interface and fetch the ddns config for it. Currently we manually specify a single "internet" interface. 
			$scope.wan_network = nets.find(function(x){ return x[".name"] == $config.wan_interface; }); 
			if($scope.wan_network) {
				$scope.wan_network.$ddns = $uci.ddns["@service"].find(function(x){ return x.interface.value == $scope.wan_network[".name"]; }); 
			}
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.onToggleDDNS = function(){
		console.log("toggle: "+$scope.data.ddnsEnabled); 
		if(!$scope.wan_network) return; 
		if(!$scope.wan_network.$ddns){
			$uci.ddns.create({
				".type": "service", 
				"interface": $scope.wan_network[".name"]
			}).done(function(ddns){
				$scope.wan_network.$ddns = ddns; 
				ddns.enabled.value = $scope.data.ddnsEnabled; 
				$scope.$apply(); 
			}); 
		} else {
			$scope.wan_network.$ddns.enabled.value = $scope.data.ddnsEnabled; 
		}
	}
	
	$scope.getItemTitle = function(item){
		return item[".name"]; 
	}
	/*
		if ($uci.network) {
			var wan = $uci.network[$config.wan_interface];
			while(wan.dns.value.length < 2) wan.dns.value.push("");
			$scope.dnsServers = wan.dns.value.map(function(x){ return { value: x }; }); 
			$scope.onDNSBlur = function(){
				wan.dns.value = $scope.dnsServers.map(function(x) { return x.value; }); 
			}; 
			$scope.wan = wan; 
			$scope.$apply(); 
		} else {
			// TODO: this should be a dynamic name (wan will not always be called wan in the future)
			$scope.$emit("Could not find WAN network on this device"); 
		}
		if ($uci.ddns && $uci.ddns["@service"]) {
			// currently we have just a hack to support the providers. TODO: later add support for many providers. 
			var provider = $uci.ddns["@service"][0]; 
			if(!$scope.allServices.find(function(x){
				return x.value == provider.service_name.value; 
			})){
				$scope.allServices.push({ label: provider.service_name.value, value: provider.service_name.value }); 
			}; 
			$scope.ddns = provider;
			$scope.$apply(); 
		} else {
			$uci.ddns.create({".type": "service"}).done(function(section){
				$scope.ddns = section; 
				$scope.$apply(); 
			}); 
		}
	}); 
	
	$scope.onApply = function(){
		$uci.save(); 
	} */
});

JUCI.app
.controller("InternetDNSPageCtrl", function ($scope, $uci, $log, $config) {
	// hardcoded dns providers that we currently support (TODO: make dynamic list)
	$scope.allServices = [
		{ label: "noip.com", value: "noip.com" }
	]; 
	$uci.sync(["network","ddns"]).done(function () {
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
			/*$scope.allServices = $uci.ddns["@service"].map(function(x){
				return { label: x.service_name.value, value: x.service_name.value };
			}); */ 
			$scope.ddns = $uci.ddns["@service"][0];
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
	} 
});

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
});

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetEthernetPhysical", function($scope, $uci, $broadcomEthernet, gettext){
	$scope.data = {}; 
	$scope.getItemTitle = function(item) {
		if(!item) return "error";
		return item[".name"];
	}
	$uci.sync(["ports", "layer2_interface_ethernet"]).done(function(){
		$scope.ports = $uci.ports["@ethport"];
		$scope.data.wan_port = $scope.ports.find(function(x){ return x.ifname.value == $uci.layer2_interface_ethernet.Wan.baseifname.value; }); 
		
		$scope.$watch("data.wan_port", function(value){
			if(!value) return; 
			$broadcomEthernet.configureWANPort(value.ifname.value); 
		}); 
		
		$scope.$apply(); 
	}); 
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetDHCPPage", function($scope, $uci, $rpc, $network, $config){
	$scope.data = {}; 
	
	$uci.sync("dhcp").done(function(){
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(net){ return net.is_lan.value && net[".name"] != "loopback"; }); 
			$scope.networks = $scope.networks.map(function(net){
				net.$dhcp = $uci.dhcp["@dhcp"].find(function(entry){
					return entry.interface.value == net[".name"]; 
				}); 
				return net; 
			}).filter(function(net){
				return net.$dhcp;
			});  
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.onSelectNetwork = function(net){
		$scope.network = net; 
	}
	
	$scope.onToggleDHCP = function(){
		if(!$scope.network) return; 
		if($scope.data.dhcpEnabled && !$scope.network.$dhcp){
			$uci.dhcp.create({
				".type": "dhcp", 
				"interface": $scope.network[".name"]
			}).done(function(dhcp){
				$scope.network.$dhcp = dhcp; 
				$scope.$apply(); 
			}); 
		}
	}
	
}); 

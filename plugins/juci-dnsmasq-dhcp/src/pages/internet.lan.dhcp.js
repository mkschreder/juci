//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetDHCPPage", function($scope, $uci, $rpc, $network, $config){
	/*$network.getNetworks().done(function(nets){
		$scope.networks = nets.filter(function(net){ return net.is_lan.value && net[".name"] != "loopback"; }); 
		$scope.availableNetworks = nets.map(function(n){
			return { label: n[".name"], value: n[".name"] }; 
		}); 
		$rpc.router.clients().done(function(clients){
			$uci.sync("dhcp").done(function(){
				$scope.dhcpConfigs = $uci.dhcp["@dhcp"]; 
				$scope.dhcpConfigs.map(function(dhcp){
					dhcp.staticHosts = $uci.dhcp["@host"].filter(function(host){
						return host.dhcp.value == dhcp[".name"] || (host.dhcp.value == "" && host.network.value == dhcp[".name"]);  
					}); 
					dhcp.connectedHosts = Object.keys(clients).filter(function(k){
						// filter out only clients that are connected to network that this dhcp entry is servicing
						return clients[k].network == dhcp.interface.value && clients[k].connected; 
					}).map(function(k){
						return {
							label: clients[k].hostname || clients[k].ipaddr, 
							value: clients[k]
						}; 
					}); 
					return dhcp; 
				}); 
				$scope.$apply(); 
			}); 
		}); 
	}); */
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

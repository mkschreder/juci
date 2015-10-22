//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusNetworkRoutes", function($scope, $rpc, $tr, $network, gettext){
	$rpc.juci.network.status.arp().done(function(arp_table){
		$scope.arp_table = arp_table.clients; 
		$rpc.juci.network.status.ipv4routes().done(function(ipv4_routes){
			$scope.ipv4_routes = ipv4_routes.routes; 
			$rpc.juci.network.status.ipv6routes().done(function(ipv6_routes){
				$scope.ipv6_routes = ipv6_routes.routes; 
				$scope.$apply(); 
			}); 
		}); 
	}); 
	$rpc.juci.network.status.ipv6neigh().done(function(){
		
	}); 
}); 

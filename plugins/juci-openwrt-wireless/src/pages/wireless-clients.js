//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("wirelessClientsPage", function($scope, $network, $rpc, $tr, gettext){
	JUCI.interval.repeat("wireless-clients-refresh", 5000, function(done){
		$rpc.juci.wireless.clients().done(function(result){
			if(!result || !result.clients) return; 
			$network.getConnectedClients().done(function(clients){
				$scope.clients = clients.filter(function(cl){
					var wcl = result.clients.find(function(wcl){ return wcl.macaddr == cl.macaddr });
					if(!wcl) return false; 
					// replace the device with actual wireless device (instead of some generic br-lan)..
					cl.device = wcl.device; 
					return true; 
				}); 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
}); 

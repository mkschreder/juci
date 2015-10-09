//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

$juci.module("internet")
.controller("InternetExHostPageCtrl", function($scope, $rpc, $config, $network, $uci, $tr){
	$scope.config = $config; 
	$scope.wan = {}; 
	$scope.connectedHosts = []; 
	
	async.series([
		function(next){
			$uci.$sync("firewall").done(function(){
				
			}).always(function(){ next(); }); 
		}, 
		function(next){
			$network.getConnectedClients().done(function(clients){
				$scope.connectedHosts = Object.keys(clients).map(function(k){
					return { label: (clients[k].hostname)?(clients[k].hostname+" ("+clients[k].ipaddr+")"):clients[k].ipaddr, value: clients[k].ipaddr }; 
				}); 
				$scope.$apply(); 
			}).always(function(){ next(); }); 
		}, 
		function(next){ 
			if($uci.firewall.dmz == undefined){
				$uci.firewall.create({".type": "dmz", ".name": "dmz"}).done(function(dmz){
					next(); 
				}).fail(function(){
					throw new Error("Could not create required dmz section in config firewall!"); 
				}); 
			} else {
				next(); 
			}
		}, 
		function(next){
			$rpc.network.interface.status({
				"interface": $config.wan_interface
			}).done(function(wan){
				if("ipv4-address" in wan)
					$scope.wan.ip = wan["ipv4-address"][0].address; 
			}).always(function(){ next(); }); 
		}
	], function(){
		$scope.firewall = $uci.firewall; 
		$scope.available = "dmz" in $uci.firewall; 
		$scope.$apply(); 
	}); 
}); 

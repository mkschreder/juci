/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app
.controller("InternetExHostPageCtrl", function($scope, $rpc, $config, $network, $uci, $tr){
	$scope.config = $config; 
	$scope.wan = {}; 
	$scope.connectedHosts = []; 
	$scope.data = {}; 

	$scope.$watch("data.selected", function(value){
		if(!value || !$uci.firewall || !$uci.firewall.dmz) return; 
		$uci.firewall.dmz.host.value = value.ipaddr; 
		$uci.firewall.dmz.ip6addr.value = value.ip6addr; 
	}); 
	// Excluded ports is read from a tmp file that is not created by default. This is a patch feature added to dmz firewall script. Please update your script if you want to use it. 
	$rpc.juci.firewall && $rpc.juci.firewall.dmz.excluded_ports().done(function(data){
		if(data.result && data.result.length){
			$scope.nonforwardedPorts = data.result;
			$scope.$apply();
		}
	});
	/* IPv6 dmz rule (from openwrt)
	config rule
        option src       wan
        option proto     tcpudp
        option dest      lan
        option dest_port 1024:65535
        option family    ipv6
        option target    ACCEPT
	*/		
	$scope.onCreateDMZConfig = function(){
		$uci.firewall.$create({".type": "dmz", ".name": "dmz"}).done(function(dmz){
			//$uci.firewall.$mark_for_reload(); 
			refresh(); 	
		}).fail(function(){
			alert($tr(gettext("Failed to create dmz configuration!"))); 
		}); 
	}
	function refresh(){
		async.series([
			function(next){
				$uci.$sync("firewall").done(function(){
		
				}).always(function(){ next(); }); 
			}, 
			function(next){ 
				if($uci.firewall.dmz == undefined) {
					$scope.done = true;  
					$scope.$apply(); 
					return; 
				}
				$scope.available = false; 
				next(); 
				/*if($uci.firewall.dmz == undefined){
					$uci.firewall.$create({".type": "dmz", ".name": "dmz"}).done(function(dmz){
						next(); 
					}).fail(function(){
						throw new Error("Could not create required dmz section in config firewall!"); 
					}); 
				} else {
					next(); 
				}*/
			}, 
			function(next){
				var fw = $uci.firewall; 
				
				$network.getConnectedClients().done(function(clients){
					$scope.connectedHosts = Object.keys(clients).map(function(k){
						if((clients[k].ipaddr == fw.dmz.host.value && fw.dmz.ip6addr.value == "") || clients[k].ip6addr == fw.dmz.ip6addr.value) $scope.data.selected = clients[k]; 
						return { label: (clients[k].hostname)?(clients[k].hostname+" ("+clients[k].ipaddr+")"):clients[k].ipaddr, value: clients[k] }; 
					}); 
					$scope.$apply(); 
				}).always(function(){ next(); }); 
			}, 
			function(next){
				// get all wan interfaces and list their ip addresses
				$network.getDefaultRouteNetworks().done(function(nets){
					var addr = []; 
					nets.map(function(net){
						net.$info["ipv4-address"].map(function(a){
							addr.push(a.address); 
						}); 
						net.$info["ipv6-address"].map(function(a){
							addr.push(a.address); 
						}); 
						$scope.wan.ip = addr.join(","); 
					}); 
				}).always(function(){ next(); }); 
			}
		], function(){
			$scope.firewall = $uci.firewall; 
			$scope.available = "dmz" in $uci.firewall; 
			$scope.done = true; 
			$scope.$apply(); 
		}); 
	} refresh(); 
}); 

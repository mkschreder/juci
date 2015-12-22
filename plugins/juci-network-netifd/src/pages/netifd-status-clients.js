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
.controller("NetifdStatusClientsPage", function($scope, $network, $firewall){
	$network.getConnectedClients().done(function(clients){
		$scope.clients = []; 
		// TODO: this is duplicate of what is in overview-net widget. We need a better way to list lan clients without treating lan as special network. 
		// TODO: this is not static. Need to find a way to more reliably separate lan and wan so we can list lan clients from all lans without including wans. 
		$firewall.getZones().done(function(zones){
			var lan_zone = zones.find(function(x){ return x.name.value == "lan"; }); 
			if(!lan_zone) { console.error("no lan zone found in firewall config!"); return; }

			$rpc.network.interface.dump().done(function(stats){
				var interfaces = stats.interface; 
				lan_zone.network.value.map(function(net){
					var iface = interfaces.find(function(x){ return x.interface == net }); 
					if(!iface) return; 
					
					clients.filter(function(cl) { return cl.device == iface.l3_device; })
					.map(function(cl){
						cl._display_html = "<"+cl._display_widget + " ng-model='client'/>"; 
						$scope.clients.push(cl);  
					}); 
				});

				$scope.$apply(); 
			}); 
		}); 

	}); 
}); 

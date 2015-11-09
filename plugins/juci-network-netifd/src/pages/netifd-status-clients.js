//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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

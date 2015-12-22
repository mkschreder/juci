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
.directive("overviewWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net.html", 
		controller: "overviewWidgetNetwork", 
		replace: true
	 };  
})
.directive("overviewStatusWidget10Network", function(){
	return {
		templateUrl: "widgets/overview-net-small.html", 
		controller: "overviewStatusWidgetNetwork", 
		replace: true
	};  
})
.controller("overviewStatusWidgetNetwork", function($scope, $uci, $rpc){
	$scope.statusClass = "text-success"; 
	JUCI.interval.repeat("overview-network", 1000, function(done){
		async.series([function(next){
			// TODO: move this to factory
			$rpc.juci.network.clients().done(function(res){
				$scope.numClients = res.clients.length; 
				$scope.done = 1; 
			}); 
		}], function(){
			done(); 
		}); 
	}); 
	
})
.controller("overviewWidgetNetwork", function($scope, $rpc, $uci, $network, $firewall, $tr, gettext){
	$scope.defaultHostName = $tr(gettext("Unknown")); 
	
	JUCI.interval.repeat("overview-netowrk-widget", 2000, function(done){
		$network.getConnectedClients().done(function(clients){
			$scope.clients = []; 
			// TODO: this is not static. Need to find a way to more reliably separate lan and wan so we can list lan clients from all lans without including wans. 
			$firewall.getZones().done(function(zones){
				var lan_zone = zones.find(function(x){ return x.name.value == "lan"; }); 
				if(!lan_zone) { console.error("no lan zone found in firewall config!"); next(); return; }

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
					done(); 
				}); 
			}); 
		}); 
	}); 

	// TODO: move this to factory
	$rpc.network.interface.dump().done(function(interfaces){
		var conn = ""; 
		if(interfaces && interfaces.interface){
			var wan4_interface = "wan"; 
			if($uci.juci.network) wan4_interface = $uci.juci.network.wan4_interface.value; 
			var i = interfaces.interface.find(function(x){
				return x.interface == wan4_interface; 
			})
			if(i){
				var dev = i.l3_device||i.device||""; 
				if(dev.indexOf("atm") == 0) conn = "ADSL"; 
				else if(dev.indexOf("ptm") == 0) conn = "VDSL"; 
				else if(dev.indexOf("eth") == 0) conn = "FTTH"; 
				else if(dev.indexOf("wwan") == 0) conn = "LTE"; 
				else if(dev.indexOf("wl") == 0) conn = "Wi-Fi"; 
				else conn = $tr(gettext("Network")); 
			}
		} 
		$scope.wan_type = conn; 
	}); 
}); 

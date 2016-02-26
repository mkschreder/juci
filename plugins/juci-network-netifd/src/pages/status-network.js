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
.controller("NetifdNetworkStatusPage", function ($scope, $uci, $rpc, gettext) {
	//$scope.expanded = false; 
		
	JUCI.interval.repeat("status.refresh", 2000, function(resume){
		var ports = {}; 
		var ports_by_name = {}; 
		async.series([
			function(next){
				$uci.$sync("network").done(function(){ next(); }); 
			}, 
			function(next){
				// get openwrt port status (sometimes the only way to read port status) 
				if($rpc.juci.swconfig){
					$rpc.juci.swconfig.status().done(function(status){
						status.ports.map(function(p){
							ports[p.id] = p; 
						}); 
						$uci.network["@switch_port_label"].map(function(x){
							var port = ports[x.id.value]; 
							if(port) {
								port.label = x.name.value; 
								ports_by_name[String(x.name.value)] = port; 
							}
						}); 
						next(); 
					}).fail(function(){
						next(); 
					}); 
				} else {
					next(); 
				}
			}, 
			function(next){
				$rpc.network.interface.dump().done(function(result){
					_interfaces = result.interface.filter(function(x){
						// filter out everything that is not an interface in the config (this will currently remove aliases as well)
						if(!$uci.network["@interface"].find(function(j){ return j[".name"] == x.interface;})) return false; 
						return x.interface != "loopback"; // filter out loopback. Is there any use case where we would want it? 
					}).map(function(x){
						// figure out correct default gateway
						if(x.route) x._defaultroute4 = x.route.find(function(r){ return r.target == "0.0.0.0" });
						if($uci.network[x.interface]) x._config = $uci.network[x.interface]; 
						return x; 
					}); 
				}).always(function(){
					next(); 
				}); 
			}, 
			function(next){
				var sections = []; 
				_interfaces.map(function(i){
					sections.push({
						name: i.interface, 
						interface: i
					}); 
				}); 
				for(var c = 0; c < sections.length; c++){
					var sec = sections[c]; 
					// TODO: this is wrong way to do this, but we have no other way to check wan status atm.
					if(sec.interface.interface == "wan" && ports_by_name["WAN"]){
						if(ports_by_name["WAN"].state == "down") sec.interface.up = false; 
					}
					//-------------
					if(sec.interface.up) {
						sec.status = "ok"; 
						sec.interface._status_text = gettext("UP"); 
						sec.interface._status_class = "success"; 
					} else if(sec.interface.pending) {
						sec.status = "progress"; 
						sec.interface._status_text = gettext("PENDING"); 
						sec.interface._status_class = "warning"; 
					} else if(!sec.interface.up) {
						sec.status = "error"; 
						sec.interface._status_text = gettext("DOWN"); 
						sec.interface._status_class = "default"; 
					} else {
						sec.status = "error"; 
						sec.interface._status_text = gettext("ERROR"); 
						sec.interface._status_class = "danger"; 
					}
				} 
				$scope.sections = sections.filter(function(x){ return x.interface !== undefined; });//.sort(function(a, b) { return a.interface.up > b.interface.up; }); 
				$scope.$apply(); 
				next(); 
			}/*, 
			function(next){
				$broadcomDsl.status().done(function(result){
					switch(result.dslstats.status){
						case 'Idle': $scope.dsl_status = 'disabled'; break; 
						case 'Showtime': $scope.dsl_status = 'ok'; break; 
						default: $scope.dsl_status = 'progress'; break; 
					}
					$scope.dslinfo = result.dslstats; 
					$scope.$apply(); 
					next(); 
				});
			}*/
		], function(){
			resume(); 
		}); 
	}); 
}); 

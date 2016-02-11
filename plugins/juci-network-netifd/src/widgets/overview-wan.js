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
.directive("overviewWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	 };  
})
.directive("overviewStatusWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan-small.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	 };  
})
.filter('formatTimer', function() {
    return function(seconds) {
		var numdays = Math.floor(seconds / 86400);
		var numhours = Math.floor((seconds % 86400) / 3600);
		var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var numseconds = ((seconds % 86400) % 3600) % 60;
		var sec = (numseconds < 10)? '0' + numseconds : '' + numseconds;
		if (numdays > 0) { return (numdays + 'd ' + numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numhours > 0) { return (numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numminutes > 0) { return (numminutes + 'm ' + sec + 's');}
		return (sec+ 's');
    };
})
.controller("overviewWidgetWAN", function($scope, $uci, $rpc, $firewall, $juciDialog, $tr, gettext){
	$scope.showDnsSettings = function(){
		if(!$scope.wan_ifs) return;
		$firewall.getZoneNetworks("wan").done(function(nets){
			var model = {
				aquired: $scope.wan_ifs,
				settings: nets
			};
			$juciDialog.show("network-wan-dns-settings-edit", {
				title: $tr(gettext("Edit DNS servers")),
				buttons: [
					{ label: $tr(gettext("Save")), value: "save", primary: true },
					{ label: $tr(gettext("Cancel")), value: "cancel" }
				],
				on_button: function(btn, inst){
					if(btn.value == "cancel"){
						nets.map(function(x){
							if(x.$reset) x.$reset();
						});
						inst.dismiss("cancel");
					}
					if(btn.value == "save"){
						inst.close();
					}
				},
				size: "md",
				model: model
			});
		});
	};
	$scope.statusClass = "text-success"; 
	JUCI.interval.repeat("overview-wan", 2000, function(done){
		$rpc.network.interface.dump().done(function(result){
			var interfaces = result.interface; 
			$firewall.getZoneNetworks("wan").done(function(wan_ifs){
				var default_route_ifs = wan_ifs.filter(function(x){ 
					return x.$info && x.$info.route && x.$info.route.length && 
						(x.$info.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; }));
				}).map(function(x){ return x.$info}); 
				var con_types = {}; 
				var all_gateways = {}; 
				default_route_ifs.map(function(i){
					var con_type = "ETH"; 
					if(i.l3_device.match(/atm/)) con_type = "ADSL"; 
					else if(i.l3_device.match(/ptm/)) con_type = "VDSL"; 
					else if(i.l3_device.match(/wwan/)) con_type = "3G/4G"; 
					con_types[con_type] = con_type; 
					i.route.map(function(r){
						if(r.nexthop != "0.0.0.0" && r.nexthop != "::") // ignore dummy routes. Note that current gateways should actually be determined by pinging them, but showing all of them is sufficient for now. 
							all_gateways[r.nexthop] = true; 
					}); 
				}); 
				$scope.connection_types = Object.keys(con_types); 
				$scope.all_gateways = Object.keys(all_gateways); 
				$scope.default_route_ifs = default_route_ifs; 
				$scope.wan_ifs = wan_ifs; 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
});

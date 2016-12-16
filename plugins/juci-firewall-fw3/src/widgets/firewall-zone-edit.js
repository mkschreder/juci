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
.directive("firewallZoneEdit", function(){
	return {
		scope: {
			zone: "=ngModel"
		}, 
		controller: "firewallZoneEdit", 
		templateUrl: "/widgets/firewall-zone-edit.html"
	}; 
})
.controller("firewallZoneEdit", function($scope, $firewall, gettext, $network, networkConnectionPicker, $uci, $tr, gettext){
	$scope.policys = [
		{ label: gettext("ACCEPT"), value: "ACCEPT" }, 
		{ label: gettext("REJECT"), value: "REJECT" }, 
		{ label: gettext("DROP"), value: "DROP" },
		{ label: gettext("FORWARD"), value: "FORWARD" }
	]; 
	
	$scope.$watch("zone", function onFirewallZoneModelChanged(zone){
		$scope.zones = {source:[], dest:[]}
		if(!zone) return; 
		// old version
		/*
		$network.getNetworks().done(function(nets){
			if(!zone || !zone.network) return; 
			$scope.networks = zone.network.value.map(function(name){
				var net = nets.find(function(x){ return x[".name"] == name; }); 
				if(!net) return null; 
				return net; 
			}).filter(function(x){ return x != null; }); 
			$scope.$apply(); 
		}); 
		*/
		$firewall.getZones().done(function(zones){
			var others = zones.filter(function(z){ return z.name.value != zone.name.value }).map(function(z){ return { name:z.name.value }; });
			$uci.$sync("firewall").done(function(){
				var forwards = $uci.firewall["@forwarding"];
				others.map(function(other){
					if(forwards.find(function(fw){ return fw.src.value == other.name && fw.dest.value == zone.name.value; }))
						$scope.zones.source.push({name: other.name, selected: true });
					else
						$scope.zones.source.push({name: other.name, selected: false });
					if(forwards.find(function(fw){ return fw.dest.value == other.name && fw.src.value == zone.name.value; }))
						$scope.zones.dest.push({ name: other.name, selected: true });
					else
						$scope.zones.dest.push({ name: other.name, selected: false });
				});
				$scope.changeForwards = function(){
					var rem = forwards.filter(function(fw){ return fw.src.value == zone.name.value || fw.dest.value == zone.name.value; });
					for(var i = rem.length; i > 0; i--){ rem[i-1].$delete();}
					$scope.zones.source.map(function(src){
						if(src.selected){
							$uci.firewall.$create({ ".type":"forwarding", "src": src.name, "dest": zone.name.value });
						}
					});
					$scope.zones.dest.map(function(dst){
						if(dst.selected){
							$uci.firewall.$create({ ".type":"forwarding", "src": zone.name.value, "dest": dst.name });
						}
					});
				};
				$scope.$apply();
			});
		});
	}); 
	
	$scope.getItemTitle = function(net){
		return net;
	}
	
	
	$scope.onAddNetwork = function(){
		if(!$scope.zone) return; 
		networkConnectionPicker.show({ exclude: $scope.zone.network.value }).done(function(network){
			var tmp = [];
			$scope.zone.network.value.map(function(net){ tmp.push(net);});
			tmp.push(network[".name"]);
			$scope.zone.network.value = tmp;
			$scope.$apply(); 
		}); 
	}
	
	$scope.onRemoveNetwork = function(conn){
		if(!$scope.zone) return; 
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to remove this network from this zone?"))){
			$scope.zone.network.value = $scope.zone.network.value.filter(function(name){
				return name != conn; 
			}); 
		}
	}
	
}); 


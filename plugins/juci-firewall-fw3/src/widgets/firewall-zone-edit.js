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
.controller("firewallZoneEdit", function($scope, $firewall, gettext, $network, networkConnectionPicker, $uci){
	$scope.policys = [
		{ label: gettext("ACCEPT"), value: "ACCEPT" }, 
		{ label: gettext("REJECT"), value: "REJECT" }, 
		{ label: gettext("DROP"), value: "DROP" },
		{ label: gettext("FORWARD"), value: "FORWARD" }
	]; 
	
	$scope.$watch("zone", function(zone){
		$scope.zones = {source:[], dest:[]}
		if(!zone) return; 
		$network.getNetworks().done(function(nets){
			if(!zone || !zone.network) return; 
			$scope.networks = zone.network.value.map(function(name){
				var net = nets.find(function(x){ return x[".name"] == name; }); 
				if(!net) return null; 
				return net; 
			}).filter(function(x){ return x != null; }); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.getItemTitle = function(net){
		return net[".name"]; 
	}
	
	
	$scope.onAddNetwork = function(){
		if(!$scope.zone) return; 
		networkConnectionPicker.show({ exclude: $scope.networks }).done(function(network){
			$scope.zone.network.value += " " + network[".name"];
			$scope.networks.push(network); 
			$scope.$apply(); 
		}); 
	}
	
	$scope.onRemoveNetwork = function(conn){
		if(!$scope.zone) return; 
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to remove this network from this zone?"))){
			$scope.zone.network.value = $scope.zone.network.value.split(" ").filter(function(name){
				return name != conn.id; 
			}).join(" "); 
			$scope.networks = $scope.networks.filter(function(x){ return x[".name"] != conn[".name"]; }); 
		}
	}
	
}).filter("uppercase", function(){
	return function(string){
		return String(string).toUpperCase();
	};
});

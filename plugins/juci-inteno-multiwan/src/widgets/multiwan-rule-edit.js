/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app.directive("multiwanRuleEdit", function($compile, $parse){
	return {
		scope: {
			model: "=ngModel"
		},
		templateUrl: "/widgets/multiwan-rule-edit.html",
		controller: "multiwanRuleEdit",
		replace: "true",
		require: "^ngModel"
	}
}).controller("multiwanRuleEdit", function($scope, $tr, gettext, $network, $firewall){
	$firewall.getZoneClients("lan").always(function(clients){
		$scope.addresses = clients.map(function(client){ 
			var name = (!client.hostname || client.hostname == "") ? "" : " (" + client.hostname + ")";
			return { label: client.ipaddr + name, value: client.ipaddr }});
	});
	$scope.addresses = [];
	$scope.protocols = [
		{ label: $tr(gettext("UDP")),	value: "udp" },
		{ label: $tr(gettext("TCP")),	value: "tcp" },
		{ label: $tr(gettext("ICMP")),	value: "icmp" }
	];
	$scope.wan_uplink = [
		{ label: $tr(gettext("LAN")),	value: "lan" },
		{ label: $tr(gettext("WAN")),	value: "wan" },
		{ label: $tr(gettext("WAN6")),	value: "wan6" },
		{ label: $tr(gettext("Load Balancer (Performance)")),	value: "fastbalncer" },
		{ label: $tr(gettext("Load Balancer (Compability)")),	value: "balancer" }
	];
	var first = true;
	$scope.$watch("model", function onMultiwanRuleModelChanged(){
		if(!$scope.model || !first) return;
		if($scope.model.src.value != '')$scope.addresses.push({ label: $scope.model.src.value, value: $scope.model.src.value });
		first = false;
	}, false);
});

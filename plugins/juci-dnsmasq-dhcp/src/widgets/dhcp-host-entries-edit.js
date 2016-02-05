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

JUCI.app.directive("dhcpHostEntriesEdit", function(){
	return {
		scope: {
			model: "=ngModel"
		},
		templateUrl: "/widgets/dhcp-host-entries-edit.html",
		controller: "dhcpHostEntriesEditCtrl",
		replace: true
	}
}).controller("dhcpHostEntriesEditCtrl", function($scope, $firewall, $uci, $tr, gettext, lanIpFactory){
	$firewall.getZoneClients("lan").done(function(clients){
		$scope.clients = clients.map(function(x){
			var name = x.ipaddr + ((x.hostname == "") ? "" : " (" + x.hostname + ")");
			return { label: name, value: x.ipaddr }
		});
	});
	$scope.placeholder = {};
	lanIpFactory.getIp().done(function(res){
		$scope.placeholder.ipv4 = res.ipv4;
		$scope.placeholder.ipv6 = res.ipv6;
	});

	$scope.onAddressTypeChange = function(value){
		if(!$scope.model) return;
		$scope.model.ip.value = "";
		$scope.model.ip.validator = (value == 'ipv4') ? new $uci.validators.IP4AddressValidator() : new $uci.validators.IP6AddressValidator();
	};
	$scope.ipAddressTypes = [
		{ label: $tr(gettext("IPv4")),	value: "ipv4" },
		{ label: $tr(gettext("IPv6")),	value: "ipv6" }
	];
	$scope.$watch("model", function onDhcpHostModelChanged(){
		if(!$scope.model) return;
		$scope.model.ip.validator = ($scope.model.family.value == 'ipv4') ? new $uci.validators.IP4AddressValidator(): new $uci.validators.IP6AddressValidator();
		$scope.names = $scope.model.name.value.map(function(name){ return { value: name }});
	}, false);
	$scope.$watch("names", function onDhcpHostNamesChanged(){
		if(!$scope.names) return;
		$scope.model.name.value = $scope.names.map(function(name){ return name.value });
	}, true);
});

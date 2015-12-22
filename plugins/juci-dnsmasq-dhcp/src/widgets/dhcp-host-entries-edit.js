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
}).controller("dhcpHostEntriesEditCtrl", function($scope, $firewall){
	$firewall.getZoneClients("lan").done(function(clients){
		$scope.clients = clients.map(function(x){ 
			var name = x.ipaddr + ((x.hostname == "") ? "" : " (" + x.hostname + ")");
			return { label: name, value: x.ipaddr }
		});
		console.log($scope.clients);
	});
	$scope.$watch("model", function(){
		if(!$scope.model) return;
		console.log($scope.model);
	}, false);
});

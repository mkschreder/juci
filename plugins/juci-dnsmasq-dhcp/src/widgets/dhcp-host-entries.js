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

JUCI.app.directive("dhcpHostEntries", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-host-entries.html",
		controller: "dhcpHostEntriesCtrl",
		replace: true
	}
}).controller("dhcpHostEntriesCtrl", function($scope, $uci, $tr, gettext, lanIpFactory){
	$uci.$sync("dhcp").done(function(){
		$scope.hosts = $uci.dhcp["@domain"];
		$scope.$apply();
	});
	$scope.ipv4 = "";
	$scope.ipv6 = "";
	
	lanIpFactory.getIp().done(function(res){
		$scope.ipv4 = res.ipv4;
		$scope.ipv6 = res.ipv6;
	});
	
	$scope.getItemTitle = function(item){
		return $tr(gettext("Hostname(s) for ")) + ((item.ip.value == "") ? ((item.family.value == "ipv4") ? $scope.ipv4 : $scope.ipv6) : item.ip.value);
	}
	$scope.onAddDomain = function(){
		$uci.dhcp.$create({ ".type":"domain", "family":"ipv4"}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onDeleteDomain = function(domain) {
		domain.$delete().done(function(){
			$scope.$apply();
		});
	};
});


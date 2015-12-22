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

// this control gets pointer to network connection and looks up proper dhcp server entry for it. 

JUCI.app
.directive("networkConnectionDhcpServerSettings", function($compile){
	return {
		scope: {
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/network-connection-dhcp-server-settings.html", 
		controller: "networkConnectionDhcpServerSettings"
	};  
})
.controller("networkConnectionDhcpServerSettings", function($scope, $network, $uci){
	$scope.data = {}; 
	$scope.data.dhcpEnabled = false; 
	$scope.$watch("connection", function(value){
		if(!value) return; 
		$uci.$sync("dhcp").done(function(){
			$scope.dhcp = $uci.dhcp["@dhcp"].find(function(x){
				return x.interface.value == value[".name"] || x[".name"] == value[".name"]; 
			}); 
			$scope.data.dhcpEnabled = $scope.dhcp && !$scope.dhcp.ignore.value; 
			$scope.$apply(); 
		}); 
	}); 
	$scope.$watch("data.dhcpEnabled", function(value){
		if(!$scope.dhcp) {
			if($scope.connection){
				$uci.dhcp.create({
					".type": "dhcp", 
					".name": $scope.connection[".name"],
					"interface": $scope.connection[".name"],
					"ignore": !value
				}).done(function(dhcp){
					$scope.dhcp = dhcp; 
					$scope.$apply(); 
				}); 
			}
		} else {
			$scope.dhcp.ignore.value = !value; 
		}
	}); 
}); 

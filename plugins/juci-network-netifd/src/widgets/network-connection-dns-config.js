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
.directive("networkConnectionDnsConfig", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-dns-config.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionDnsConfig", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionDnsConfig", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.$watch("interface", function(value){
		if(!value) return; 
		$scope.data = {
			primaryDNS: value.dns.value[0] || "", 
			secondaryDNS: value.dns.value[1] || ""
		}; 
	}); 
	$scope.$watch("data.primaryDNS", function(value){
		if(!$scope.interface) return; 
		$scope.interface.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
	$scope.$watch("data.secondaryDNS", function(value){
		if(!$scope.interface) return; 
		$scope.interface.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
}); 

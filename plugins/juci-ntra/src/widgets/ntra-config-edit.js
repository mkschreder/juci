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
.directive("ntraConfigEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/ntra-config-edit.html", 
		controller: "ntraConfigEdit", 
		scope: {
			ntra: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("ntraConfigEdit", function($scope, $network, $tr, gettext){
	function updateLink(){
		$scope.accessLink = ""; 
		if(!$scope.ntra) return; 
		$scope.accessLink = $scope.ntra.protocol.value + "://" + $scope.wanip + ":" + $scope.ntra.local_port.value; 
	}
	
	function doWANCheck(){
		return $network.getDefaultRouteNetworks().done(function(wanifs){
			$scope.wanip = null; 
			if(wanifs.length){
				// we currently simply use first available wan network by default. This will need to be updated to reflect how backend does it. 
				// we also do not currently show wan link for ipv6 address. Basically very very simple solution here. 
				var wan = wanifs[0]; 
				if(wan && wan.$info && wan.$info["ipv4-address"] && wan.$info["ipv4-address"].length){
					$scope.wanip = wan.$info["ipv4-address"][0].address; 
				} 
				updateLink(); 
			}
			$scope.$apply(); 
		}); 
	}

	JUCI.interval.repeat("ntra-wan-check", 2000, function(next){
		doWANCheck().done(function(){ next(); }); 
	}); 

	$scope.allProtocols = [
		{ label: $tr(gettext("HTTPS")), value: "https" },
		{ label: $tr(gettext("HTTP")), value: "http" }
	]; 

	$scope.$watch("ntra", function(value){
		if(!value) return; 
		updateLink(); 
	}); 
}); 

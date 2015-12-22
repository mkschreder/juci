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
.controller("InternetFirewallPageCtrl", function($scope, $uci, $firewall){
	$scope.data = {}; 
	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		$scope.$apply(); 
	}); 
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	});

	$firewall.nat.isEnabled().done(function(enabled){
		$scope.data.nat_enabled = enabled; 
		$scope.$apply(); 
	});
	
	$scope.onEnableNAT = function(){
		$firewall.nat.enable($scope.data.nat_enabled); 
	}

	$uci.$sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.data.enabled = $uci.firewall["@zone"].filter(function(zone){ 
			return zone.name.value == "wan" && zone.input.value == "REJECT" && zone.forward.value == "REJECT"; 
		}).length > 0; 
		$scope.$apply(); 
	}); 
	
}); 

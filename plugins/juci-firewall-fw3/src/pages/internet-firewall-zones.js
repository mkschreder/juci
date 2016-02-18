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
.controller("InternetFirewallZonesPage", function($scope, $firewall, $uci){

	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		$scope.$apply(); 
	}); 
	
	$scope.getItemTitle = function(item){
		return item.name.value; 
	}
	
	$scope.onCreateZone = function(){
		$uci.firewall.$create({
			".type": "zone", 
			"name": "new_zone"
		}).done(function(zone){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteZone = function(zone){
		if(!zone) alert(gettext("Please select a zone to delete!")); 
		if(confirm(gettext("Are you sure you want to delete this zone?"))){
			zone.$delete().done(function(){
				// remove any forwarding rules that mention zone have deleted. 
				var rem = [];
				$uci.firewall["@forwarding"].map(function(fw){
					if(fw.src.value == zone.name.value || fw.dest.value == zone.name.value){
						rem.push(fw);
					}
				});
				async.eachSeries(rem, function(x, next){
					x.$delete().always(function(){ next(); }); 
				}, function(){
					$scope.$apply(); 
				}); 
			}); 
		}
	}
	
}); 

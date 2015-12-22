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
.controller("InternetFirewallForwardingPage", function($scope, $uci, $firewall){
	$scope.data = {}; 
	$firewall.getZones().done(function(zones){
		$uci.$sync("firewall").done(function(){
			var forwards = []; 
			zones.map(function(src){
				zones.map(function(dst){
					if(src.name.value == dst.name.value) return; 
					var fwd = $uci.firewall["@forwarding"].find(function(x){ return x.src.value == src.name.value && x.dest.value == dst.name.value; }); 
					forwards.push({
						title: src.name.value + " - > "+dst.name.value, 
						enabled: fwd != null, 
						src: src.name.value, 
						dst: dst.name.value, 
						base: fwd
					}); 
				}); 
			}); 
			$scope.forwards = forwards; 
			$scope.$apply(); 
		}); 
	}); 
	$scope.onToggleForward = function(fwd){
		console.log("forward: "+fwd); 
		if(!fwd.enabled && !fwd.base){
			$uci.firewall.create({
				".type": "forwarding", 
				"src": fwd.src, 
				"dest": fwd.dst
			}).done(function(section){
				fwd.base = section; 
				fwd.enabled = true; 
				$scope.$apply(); 
			}); 
		} else if(fwd.base){
			fwd.base.$delete().done(function(){
				fwd.base = null; 
				$scope.$apply(); 
			}); 
		}
	}
}); 

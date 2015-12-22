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
.controller("wirelessFilteringPage", function($scope, $uci, gettext){
	window.uci = $uci; 
	$scope.uci = $uci; 
	
	$uci.$sync(["wireless", "hosts"]).done(function(){
		$scope.interfaces = $uci.wireless['@wifi-iface'];
		
		// TODO: ================ this is a duplicate. It should be put elsewhere!
		$scope.devices = $uci.wireless["@wifi-device"].map(function(x){
			// TODO: this should be a uci "displayname" or something
			if(x.band.value == "a") x[".label"] = gettext("5GHz"); 
			else if(x.band.value == "b") x[".label"] = gettext("2.4GHz"); 
			return { label: x[".label"], value: x[".name"] };
		}); 
		$uci.wireless["@wifi-iface"].map(function(x){
			var dev = $uci.wireless[x.device.value]; 
			x[".frequency"] = dev[".label"]; 
		});  
		// ========================
		
		$scope.$apply(); 
	}).fail(function(err){
		console.log("failed to sync config: "+err); 
	}); 
	
}); 

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

gettext("network.interface.type.none.tab.title"); 

JUCI.app
.directive("networkConnectionTypeNoneEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-none-edit.html", 
		controller: "networkConnectionTypeNoneEdit", 
		replace: true
	 };  
})
.controller("networkConnectionTypeNoneEdit", function($scope, $ethernet, $modal, $tr, gettext){
	// expose tab title 
	gettext("network.interface.type.none.tab.title"); 

	$ethernet.getAdapters().done(function(devs){
		$scope.baseDevices = devs.filter(function(dev){ return !dev.loopback }).map(function(dev){
			return { label: dev.device + " ("+dev.name+")", value: dev.device }; 
		});
		$scope.$apply();  
	}); 
}); 

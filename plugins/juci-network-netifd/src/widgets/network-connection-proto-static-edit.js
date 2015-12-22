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
.directive("networkConnectionProtoStaticEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-static-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoStaticEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoStaticEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.$watch("interface", function(iface){
		if(!iface) return; 
		
	}); 
	
	$scope.$watchCollection("bridgedInterfaces", function(value){
		if(!value || !$scope.interface || !(value instanceof Array)) return; 
		$scope.interface.ifname.value = value.join(" "); 
	}); 
	
}); 

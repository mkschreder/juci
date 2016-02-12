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
.controller("InternetLANRoutesPage", function($scope, $uci, $network){
	$network.getNetworks().done(function(lans){
		$scope.routes = $uci.network["@route"]; 
		$scope.routes6 = $uci.network["@route6"]; 
		$scope.allNetworks = lans.filter(function(net){
			return net[".name"] != "loopback"; 
		}).map(function(net){
			return { label: net[".name"], value: net[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 

	$scope.onAddRoute = function(){
		$uci.network.$create({
			".type": "route"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteRoute = function(route){
		if(!route) return; 
		route.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onAddRoute6 = function(){
		$uci.network.$create({
			".type": "route6"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

}); 

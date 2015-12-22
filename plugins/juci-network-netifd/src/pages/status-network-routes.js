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
.controller("StatusNetworkRoutes", function($scope, $rpc, $tr, $network, gettext){
	$rpc.juci.network.status.arp().done(function(arp_table){
		$scope.arp_table = arp_table.clients; 
		$rpc.juci.network.status.ipv4routes().done(function(ipv4_routes){
			$scope.ipv4_routes = ipv4_routes.routes; 
			$rpc.juci.network.status.ipv6routes().done(function(ipv6_routes){
				$scope.ipv6_routes = ipv6_routes.routes; 
				$scope.$apply(); 
			}); 
		}); 
	}); 
	$rpc.juci.network.status.ipv6neigh().done(function(result){
		$scope.neighbors = result.neighbors; 	
		$scope.$apply(); 
	}); 
}); 

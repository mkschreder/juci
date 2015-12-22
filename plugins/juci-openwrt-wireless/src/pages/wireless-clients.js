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
.controller("wirelessClientsPage", function($scope, $network, $rpc, $tr, gettext){
	JUCI.interval.repeat("wireless-clients-refresh", 5000, function(done){
		$rpc.juci.wireless.clients().done(function(result){
			if(!result || !result.clients) return; 
			$network.getConnectedClients().done(function(clients){
				$scope.clients = clients.filter(function(cl){
					var wcl = result.clients.find(function(wcl){ return wcl.macaddr == cl.macaddr });
					if(!wcl) return false; 
					// replace the device with actual wireless device (instead of some generic br-lan)..
					cl.device = wcl.device; 
					return true; 
				}); 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
}); 

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
.controller("InternetWanServices", function($scope, $rpc, $network, $uci, $tr){
	$uci.$sync("firewall").done(function(){
		function findRule(service){
			return $uci.firewall["@rule"].find(function(r){
				return r.src.value == "wan" && r.proto.value == service.proto && r.dest_port.value == parseInt(service.listen_port); 
			});
		}
		$network.getServices().done(function(services){
			$scope.services = services.filter(function(x){ return x.listen_ip == "0.0.0.0" })
			.map(function(svc){
				var rule = findRule(svc); 
				svc.$rule = rule; 
				svc.$allow = (rule && rule.enabled.value)?true:false; 
				return svc; 
			}); 
			$scope.$apply(); 
		}); 
		$scope.getServiceTitle = function(svc){
			return svc.name + " (" + svc.listen_port + ")"; 	
		}
	}); 
}); 

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
.directive("firewallWanServiceEdit", function(){
	return {
		scope: {
			service: "=ngModel"
		}, 
		controller: "firewallWanServiceEdit", 
		templateUrl: "/widgets/firewall-wan-service-edit.html"
	}; 
})
.controller("firewallWanServiceEdit", function($scope, $uci, $firewall){
	$scope.onChangeState = function(){ 
		var service = $scope.service; 
		if(!service.$rule || !service.$rule[".name"]){
			$uci.firewall.$create({
				".type": "rule", 
				"name": "Allow connection to "+service.name+" port "+service.listen_port+" from wan interface", 
				"src": "wan", 
				"proto": service.proto, 
				"dest_port": service.listen_port, 
				"target": "ACCEPT"
			}).done(function(rule){
				service.$rule = rule; 
				$scope.$apply(); 
			}); 
		}
	}
}); 

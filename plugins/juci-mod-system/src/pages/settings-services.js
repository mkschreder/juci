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
.controller("ServicesStatusPage", function($scope, $rpc, gettext){
	JUCI.interval.repeat("juci-services-page", 5000, function(done){
		$rpc.juci.system.service.list().done(function(result){
			$scope.services = result.services; 
			$scope.services.map(function(service){
				service.reload = false;
				if(!service.start_priority){
					service.start_priority = 9999;
				}
			}); 
			$scope.services.sort(function(a,b){
				return a.start_priority - b.start_priority;
			});
			$scope.$apply();
			done(); 
		});
	}); 

	$scope.onServiceEnable = function(service){
		if(service.enabled){
			$rpc.juci.system.service.disable(service).done(function(result){
				console.log("service: " + service.name + " is disabled");
				$scope.$apply(); 
			});	
		} else {
			$rpc.juci.system.service.enable(service).done(function(result){
				console.log("service: " + service.name + " is enabled");
				$scope.$apply();
			});
		}
	}
	
	$scope.onServiceReload = function(service){
		service.reload = true;
		$rpc.juci.system.service.reload(service).done(function(result){
			console.log("service: " + service.name + " is reloded");
			service.reload = false;
			$scope.$apply();
		});
	}

	$scope.onServiceToggle = function(service){
		if(service.running){
			$rpc.juci.system.service.stop(service).done(function(result){
				service.running = true;
				console.log("service: " + service.name + " is stoped");
				$scope.$apply(); 
			});	
		} else {
			$rpc.juci.system.service.start(service).done(function(result){
				service.running = false;
				console.log("service: " + service.name + " is started");
				$scope.$apply();
			});
		}
	}
}); 

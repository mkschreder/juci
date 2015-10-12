//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

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

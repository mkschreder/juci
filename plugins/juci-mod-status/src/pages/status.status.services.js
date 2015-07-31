//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("ServicesStatusPage", function($scope, $rpc, gettext){
	$rpc.service.list().done(function(result){
		var services = []; 
		Object.keys(result).map(function(k){
			var service = result[k]; 
			if(service.instances){
				var instance = 0; 
				Object.keys(service.instances).map(function(ik){
					var inst = service.instances[ik]; 
					if(inst.command)
						inst.command = inst.command.join(" "); 
					inst.name = k+"."+instance; 
					instance++; 
					services.push(inst); 
				}); 
			} else {
				service.name = k; 
				service.running = false; 
				services.push(service); 
			}
		}); 
		$scope.services = services; 
		$scope.$apply(); 
	}); 
}); 

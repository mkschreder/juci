//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetWanServices", function($scope, $rpc, $config, $network, $uci, $tr){
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

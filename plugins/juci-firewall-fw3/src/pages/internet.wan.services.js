//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetWanServices", function($scope, $rpc, $config, $network, $uci, $tr){
	$uci.sync("firewall").done(function(){
		function findRule(service){
			return $uci.firewall["@rule"].find(function(r){
				return r.src.value == "wan" && r.proto.value == service.proto && r.dest_port.value == parseInt(service.listen_port); 
			});
		}
		$network.getServices().done(function(services){
			$scope.services = services.filter(function(x){ return x.listen_ip == "0.0.0.0" }).map(function(svc){
				var rule = findRule(svc); 
				svc.$allow = (rule)?true:false; 
				return svc; 
			}); 
			$scope.$apply(); 
		}); 
		
		$scope.onChangeState = function(service){
			var rule = findRule(service); 
			if(rule){
				rule.enabled.value = service.$allow; 
			} else {
				$uci.firewall.create({
					".type": "rule", 
					"name": "Allow connection to "+service.name+" port "+service.listen_port+" from wan interface", 
					"src": "wan", 
					"proto": service.proto, 
					"dest_port": service.listen_port, 
					"target": "ACCEPT"
				}).done(function(){
					
				}); 
			}
		}
	}); 
}); 

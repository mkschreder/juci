//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetLayer2", function($scope, $uci, $rpc, $ethernet, $network, $config){
	$scope.config = $config; 

	$scope.order = function(field){
		$scope.predicate = field; 
		$scope.reverse = !$scope.reverse; 
	}

	$ethernet.getAdapters().done(function(adapters){
		$scope.adapters = adapters.filter(function(a){
			return (!a.flags || !a.flags.match("NOARP")); 
		}).map(function(a){
			var type = "unknown"; 
			if(["eth", "eth-bridge", "eth-port", "vlan", "wireless", "vdsl", "adsl"].indexOf(a.type) != -1){ 
				type = a.type; 
			} 
			a._icon = type+((a.state == "DOWN")?"_disabled":""); 
			return a; 
		}); 
		$scope.$apply(); 
	}); 
}); 

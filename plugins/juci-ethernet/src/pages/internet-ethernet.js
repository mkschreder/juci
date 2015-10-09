//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetLayer2", function($scope, $uci, $rpc, $ethernet, $network, $config){
	$scope.config = $config; 
	
	$ethernet.getAdapters().done(function(adapters){
		$scope.adapters = adapters.filter(function(a){
			return (!a.flags || !a.flags.match("NOARP")); 
		});  
	
		$scope.$apply(); 
	}); 
}); 

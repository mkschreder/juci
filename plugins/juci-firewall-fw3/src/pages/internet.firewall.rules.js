//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallRulesPage", function($scope, $uci, $firewall, $config){
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	}); 
	$uci.sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.$apply(); 
	});  
	$scope.getItemTitle = function(item){
		return item.name.value; 
	}
}); 

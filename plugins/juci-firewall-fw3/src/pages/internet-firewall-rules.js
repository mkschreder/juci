//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallRulesPage", function($scope, $uci, $firewall){
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	}); 
	$uci.$sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.$apply(); 
	});  
	$scope.getItemTitle = function(item){
		return item.name.value || item[".name"]; 
	}
	
	
	$scope.onCreateRule = function(){
		$uci.firewall.create({
			".type": "rule", 
			"name": "new_rule"
		}).done(function(rule){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteRule = function(rule){
		if(!rule) alert(gettext("Please select a rule to delete!")); 
		if(confirm(gettext("Are you sure you want to delete this rule?"))){
			rule.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 

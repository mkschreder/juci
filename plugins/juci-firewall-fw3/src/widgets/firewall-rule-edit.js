JUCI.app
.directive("firewallRuleEdit", function(){
	return {
		scope: {
			rule: "=ngModel"
		}, 
		controller: "firewallRuleEdit", 
		templateUrl: "/widgets/firewall-rule-edit.html"
	}; 
})
.controller("firewallRuleEdit", function($scope, $firewall){
	
}); 

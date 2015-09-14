//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("firewallWanServiceEdit", function(){
	return {
		scope: {
			service: "=ngModel"
		}, 
		controller: "firewallWanServiceEdit", 
		templateUrl: "/widgets/firewall-wan-service-edit.html"
	}; 
})
.controller("firewallWanServiceEdit", function($scope, $firewall){
	
}); 

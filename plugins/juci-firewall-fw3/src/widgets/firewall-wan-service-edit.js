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
.controller("firewallWanServiceEdit", function($scope, $uci, $firewall){
	$scope.onChangeState = function(){ 
		var service = $scope.service; 
		if(!service.$rule || !service.$rule[".name"]){
			$uci.firewall.create({
				".type": "rule", 
				"name": "Allow connection to "+service.name+" port "+service.listen_port+" from wan interface", 
				"src": "wan", 
				"proto": service.proto, 
				"dest_port": service.listen_port, 
				"target": "ACCEPT"
			}).done(function(rule){
				service.$rule = rule; 
				$scope.$apply(); 
			}); 
		}
	}
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("netifdSwitchVlanEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/netifd-switch-vlan-edit.html", 
		controller: "netifdSwitchVlanEdit", 
		scope: {
			vlan: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("netifdSwitchVlanEdit", function($scope, $ethernet){	
	$ethernet.getAdapters().done(function(devs){
		$scope.allBaseDevices = devs.map(function(d){
			return { label: d.name, value: d.device }; 
		}); 
		$scope.$apply(); 
	}); 
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("ddnsNetworkSettingsEdit", function($compile){
	return {
		scope: {
			network: "=ngModel"
		}, 
		templateUrl: "/widgets/ddns-network-settings-edit.html", 
		controller: "ddnsNetworkSettingsEdit"
	};
})
.controller("ddnsNetworkSettingsEdit", function($scope){
	// hardcoded dns providers that we currently support (TODO: make dynamic list)
	$scope.allServices = [
		{ label: "noip.com", value: "noip.com" }
	]; 
	$scope.$watch("network", function(value){
		if(!value) return; 
		$scope.ddns = value; 
	}); 
}); 

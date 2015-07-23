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
	$scope.$watch("network", function(value){
		if(!value) return; 
		$scope.ddns = value.$ddns; 
	}); 
}); 

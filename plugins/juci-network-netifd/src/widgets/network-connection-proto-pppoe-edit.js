//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoPppoeEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-pppoe-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppoeEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoPppoeEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.$watch("interface", function(){
		if(!$scope.interface) return;
		$scope.interface.type.value = "";
	}, false);
})
.directive("networkConnectionProtoPppoeAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-pppoe-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
}).
directive("networkConnectionProtoPppoePhysicalEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-standalone-physical.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
}); 

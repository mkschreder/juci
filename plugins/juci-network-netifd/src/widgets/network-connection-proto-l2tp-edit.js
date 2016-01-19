//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoL2tpEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-l2tp-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		controller: "networkConnectionProtoL2tpEditCtrl",
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoL2tpEditCtrl", function($scope){
	$scope.showPass = false;
	$scope.toggleShowPass = function(){$scope.showPass = !$scope.showPass;};
})
.directive("networkConnectionProtoL2tpAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-l2tp-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

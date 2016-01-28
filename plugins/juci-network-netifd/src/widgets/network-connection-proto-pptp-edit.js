//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoPptpEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-pptp-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		controller: "networkConnectionProtoPptpEditCtrl",
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoPptpEditCtrl", function($scope){
	$scope.showPass = false;
	$scope.togglePass = function(){$scope.showPass = !$scope.showPass;};
})
.directive("networkConnectionProtoPptpAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-pptp-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProto6in4Edit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6in4-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		controller: "networkConnectionProto6in4EditCtrl",
		require: "^ngModel"
	};
})
.controller("networkConnectionProto6in4EditCtrl", function($scope){
	$scope.showPass = false;
	$scope.togglePass = function(){$scope.showPass = !$scope.showPass;};
	//TODO: when on apply excists add a check if _update.value == false set tunnelid, username, password.value to empty string
})
.directive("networkConnectionProto6in4AdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6in4-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

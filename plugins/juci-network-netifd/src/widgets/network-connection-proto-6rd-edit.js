//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProto6rdEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6rd-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProto6rdAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6rd-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

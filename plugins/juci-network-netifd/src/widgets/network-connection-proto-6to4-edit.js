//! Author Reidar Cederqivst <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProto6to4Edit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6to4-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProto6to4AdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-6to4-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

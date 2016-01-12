//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 

JUCI.app
.directive("networkConnectionProtoPppoaEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-pppoa-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppoaEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoPppoaEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	
})
.directive("networkConnectionProtoPppoaPhysicalEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-standalone-physical.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoPppoaAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-pppoa-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

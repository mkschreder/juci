//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoDsliteEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-dslite-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
})
.directive("networkConnectionProtoDsliteAdvancedEdit", function(){
	return { 
		templateUrl: "/widgets/network-connection-proto-dslite-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		controller: "networkConnectionProtoDsliteAdvancedEditCtrl",
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoDsliteAdvancedEditCtrl", function($scope, $uci){
	$scope.allInterfaces = $uci.network["@interface"].map(function(interf){ return { label: String(interf[".name"]).toUpperCase(), value: interf[".name"]}}).filter(function(x){ return x.value != "loopback" });
	$scope.$watch("interface", function onNetworkProtoDSliteModelChanged(){
		if(!$scope.interface || !$scope.allInterfaces) return;
		if($scope.allInterfaces.find(function(x){ return x.value == $scope.interface.tunlink.value }) == undefined) $scope.interface.tunlink.value = "";
	}, false);
});

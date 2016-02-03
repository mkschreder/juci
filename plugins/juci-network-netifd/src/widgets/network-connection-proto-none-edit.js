

JUCI.app
.directive("networkConnectionProtoNoneEdit", function(){
	return {
		replace: true,
		controller: "networkConnectionProtoNoneEditCtrl"
	};
})
.directive("networkConnectionProtoNonePhysicalEdit", function(){
	return {
		template: "<div><h2 translate>Bridge devices</h2><network-connection-type-bridge-edit ng-model=\"interface\"></network-connection-type-bridge-edit></div>",
		scope: {
			interface: "=ngModel",
			protos: "="
		},
		replace: true,
		require: "^ngModel"
	};
})
.controller("networkConnectionProtoNoneEditCtrl", function($scope){
	$scope.$watch("interface", function(){
		if(!$scope.interface) return;
		$scope.interface.type.value = "bridge";
	}, false);
});

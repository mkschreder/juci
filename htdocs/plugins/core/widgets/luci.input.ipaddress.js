JUCI.app
.directive("luciInputIpAddress", function () {
	var plugin_root = $juci.module("core").plugin_root;
	return {
		templateUrl: plugin_root + "/widgets/luci.input.ipaddress.html",
		restrict: 'E',
		scope: {
				label: "=",
				ngModel: "="
		},
		require: "^ngModel",
		link: function (scope, element, attrs, ctrl) {
			
		}
	};
})
.controller("luciInputIpAddress", function($scope){
	$scope.data = [];

	if($scope.ngModel && $scope.ngModel.split){
		var parts = $scope.ngModel.split(".");
		$scope.data[0] = parts[0]||"";
		$scope.data[1] = parts[1]||"";
		$scope.data[2] = parts[2]||"";
		$scope.data[3] = parts[3]||"";
	}

	$scope.$watch("data", function() {
		var ipAddress = $scope.data.join('.');
		$scope.ngModel = ipAddress;
	}, true);
}); 

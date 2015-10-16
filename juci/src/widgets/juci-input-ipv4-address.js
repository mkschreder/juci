//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("juciInputIpv4Address", function () {
	return {
		templateUrl: "/widgets/juci-input-ipv4-address.html",
		controller: "juciInputIpv4Address",
		restrict: 'E',
		scope: {
				ngModel: "="
		},
		require: "^ngModel"
	};
})
.controller("juciInputIpv4Address", function($scope){
	$scope.data = {parts: ["0", "0", "0", "0"]};
	
	$scope.$watch("ngModel", function(value){
		if(!$scope.ngModel || !$scope.ngModel.split) return; 
		var parts = $scope.ngModel.split("."); 
		// update only if changed to avoid looping updates
		Object.keys(parts).map(function(k){
			if(parts[k] != $scope.data.parts[k])
				$scope.data.parts[k] = parts[k]; 
		}); 
	}); 

	$scope.$watch("data.parts", function() {
		if(!$scope.data.parts || !$scope.data.parts.join) return; 
		var ipaddr = $scope.data.parts.join('.');
		if($scope.ngModel != ipaddr) $scope.ngModel = ipaddr; 
	}, true);
}); 

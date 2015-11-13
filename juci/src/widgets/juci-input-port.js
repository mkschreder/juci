//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("juciInputPort", function () {
	return {
		templateUrl: "/widgets/juci-input-port.html",
		restrict: 'E',
		replace: true,
		scope: {
			model: "=ngModel", 
			portRange: "="
		},
		require: "ngModel", 
		controller: "juciInputPortController"
	};
})
.controller("juciInputPortController", function($scope, $log) {
	$scope.startPort = ""; 
	$scope.endPort = ""; 
	$scope.port = ""; 
	
	$scope.$watch("model", function(value){
		if($scope.portRange && value && value.split){
			var parts = value.split("-"); 
			$scope.startPort = parts[0]||""; 
			$scope.endPort = parts[1]||""; 
		} else {
			$scope.port = value; 
		}
	}); 
	(function(){
		function updateModel(value){
			if($scope.portRange) {
				$scope.model = $scope.startPort + "-" + $scope.endPort; 
				$scope.port = $scope.startPort; 
			} else {
				// filter out anything that is not a number
				//var port = String($scope.port).replace(/[^0-9]*/g, "");
				$scope.model = $scope.port; 
				$scope.endPort = ""; 
				$scope.startPort = $scope.port; 
			}
		}
		$scope.$watch("startPort", updateModel); 
		$scope.$watch("endPort", updateModel); 
		$scope.$watch("port", updateModel); 
	})(); 
});

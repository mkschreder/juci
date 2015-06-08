$juci.app.directive("juciInputTimespan", function () {
	var plugin_root = $juci.module("core").plugin_root;
	return {
		templateUrl: plugin_root + "/widgets/juci.input.timespan.html",
		restrict: 'E',
		replace: true,
		scope: {
			model: "=ngModel"
		}, 
		controller: "juciInputTimespan"
	};
}).controller("juciInputTimespan", function($scope){
	$scope.data = {
		from: "", to: ""
	}; 
	$scope.$watch("model", function(model){
		if(model && model.value && model.value.split){
			var value = model.value; 
			var parts = value.split("-"); 
			$scope.data.from = parts[0]||""; 
			$scope.data.to = parts[1]||""; 
		} else {
			$scope.data.to = $scope.data.from = ""; 
		}
	}); 
	
	(function(){
		function updateTime(value){
			if($scope.model){
				if($scope.data.from && $scope.data.to) $scope.model.value = ($scope.data.from||"") + "-"+($scope.data.to||""); 
				else $scope.model.value = ""; 
			}
		}
		$scope.$watch("data.from", updateTime); 
		$scope.$watch("data.to", updateTime); 
	})(); 
}); 

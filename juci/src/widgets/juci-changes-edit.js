//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciChangesEdit", function(){
	return {
		templateUrl: "/widgets/juci-changes-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "juciChangesEditCtrl"
	};
})
.controller("juciChangesEditCtrl", function($scope){
	$scope.onRevertOption = function(item){
		if(!$scope.model.reverted) $scope.model.reverted = [];
		if($scope.model.changes[item]){
			$scope.model.reverted.push($scope.model.changes[item]);
			$scope.model.changes.splice(item, 1);
		}
		console.log($scope.model);
	};
});

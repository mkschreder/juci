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
	};
}).filter("maxlength", function(){
	return function(input, length){
		length = (typeof length != "number") ? 50 : length;
		input = input || "";
		console.log(length);
		console.log(String(input).length);
		if(String(input).length < length) return input;
		var output = "";
		output = String(input).slice(0, length) + "...";
		return output;
	};
});

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciSelect", function($parse, gettext){
	return {
		restrict: 'E', 
		scope: {
			ngModel: "=", 
			ngItems: "=", 
			editable: "@",
			checkbox: "@",
			enabled: "=",
			onChange: "&", 
			placeholder: "@"
		}, 
		require: ["^ngModel", "?placeholder"], 
		templateUrl: "/widgets/juci-select.html", 
		controller: function($scope, $attrs, $parse, gettext, $tr){
			var ngModel = $parse($attrs.ngModel);
			if(!$scope.placeholder) $scope.placeholder = $tr(gettext("-- Select One --"));
			$scope.select = function(item){
				$scope.onChange({$item: item, $value: item.value, $oldvalue: ngModel($scope.$parent)}); 
				ngModel.assign($scope.$parent, item.value); 
				$scope.selected = item; 
			}

			$scope.$watch("ngItems", function(){
				if($scope.ngItems == undefined || $scope.ngModel == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			}); 

			$scope.$watch("ngModel", function(value){
				if(value == undefined || $scope.ngItems == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			});
		}
	}; 
}); 

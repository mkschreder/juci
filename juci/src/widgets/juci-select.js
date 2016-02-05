/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

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
				if($scope.onChange({$item: item, $value: item.value, $oldvalue: ngModel($scope.$parent)}) === false) return;
				ngModel.assign($scope.$parent, item.value); 
				$scope.selected = item; 
			}

			$scope.$watch("ngItems", function onJuciSelectItemsChanged(){
				if($scope.ngItems == undefined || $scope.ngModel == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			}); 

			$scope.$watch("ngModel", function onJuciSelectModelChanged(value){
				if(value == undefined || $scope.ngItems == undefined) return; 
				$scope.selected = $scope.ngItems.find(function(x){ return x.value == ngModel($scope.$parent); }); 
			});
		}
	}; 
}); 

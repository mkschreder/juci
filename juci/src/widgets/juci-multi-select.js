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
.directive("juciMultiSelect", function($compile){
	return {
		templateUrl: "/widgets/juci-multi-select.html", 
		controller: "juciMultiSelect", 
		scope: {
			model: "=ngModel",
			items: "=ngItems",
			getItemTitle: "&itemLabel" 
		}, 
		replace: true
	 };  
})
.controller("juciMultiSelect", function($scope, $config, $state, $localStorage, $tr, gettext){
	$scope.data = { 
		input: [], 
		output: []
	};
		
	function update(){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		$scope.data.input = $scope.items.map(function(i){
			return {
				label: $scope.getItemTitle({ "$item": i }),
				model: i, 
				selected: false
			}; 
		}); 
		$scope.model.forEach(function(x){
			var item = {
				label: $scope.getItemTitle({ "$item": x }),
				model: x, 
				selected: true
			}; 
			//$scope.data.input.push(item); 
			$scope.data.input.push(item); 
		}); 
	}
	
	$scope.onItemClick = function(item){
		if(!$scope.items || !$scope.model || !($scope.items instanceof Array) || !($scope.model instanceof Array)) return; 
		if(item.selected) $scope.model.push(item.model);
		else {
			$scope.model.splice($scope.model.indexOf(item.model), 1); 
		}
	}

	$scope.$watch("model", function onJuciSelectModelChanged(model){
		update();
	}); 

	$scope.$watch("items", function onJuciSelectItemsChanged(items){
		update();
	});
}); 

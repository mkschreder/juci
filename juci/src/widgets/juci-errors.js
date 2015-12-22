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
.directive("juciErrors", function(){
	return {
		// accepted parameters for this tag
		scope: {
			ngModel: "="
		}, 
		templateUrl: "/widgets/juci-errors.html", 
		replace: true, 
		controller: "juciErrors"
	}; 
})
.controller("juciErrors", function($scope, $rootScope, $localStorage){
	$scope.$watch("ngModel", function(value){
		if(value) $scope.errors = $scope.ngModel; 
		else $scope.errors = $rootScope.errors; 
	}); 
}); 

JUCI.app
.directive("juciError", function(){
	return {
		// accepted parameters for this tag
		scope: {
			value: "="
		}, 
		template: '<div ng-show="value" class="alert-danger" style="margin-top: 10px; font-size: 0.8em; padding: 5px; border-radius: 5px">{{value}}</div>', 
		replace: true
	}; 
}); 

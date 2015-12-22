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
.directive("juciProgress", function(){
	return {
		// accepted parameters for this tag
		scope: {
			value: "=", 
			total: "=", 
			units: "="
		}, 
		templateUrl: "/widgets/juci-progress.html", 
		replace: true, 
		controller: "juciProgressControl",
		link: function(scope, element, attributes){
			// make sure we interpret the units as string
			scope.units = attributes.units; 
		}
	}; 
})
.controller("juciProgressControl", function($scope, $navigation){
	function update(){
		if($scope.value && Number($scope.value) != 0)
			$scope.width = Math.round((Number($scope.value||0) / Number($scope.total||0)) * 100); 
		else
			$scope.width = 0; 
	}
	$scope.$watch("value", update);
	$scope.$watch("total", update); 
}); 

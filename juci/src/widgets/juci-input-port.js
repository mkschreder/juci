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

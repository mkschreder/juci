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
.directive("juciInputIpv4Address", function () {
	return {
		templateUrl: "/widgets/juci-input-ipv4-address.html",
		controller: "juciInputIpv4Address",
		restrict: 'E',
		scope: {
				placeholder: "@",
				ngModel: "="
		},
		require: "ngModel"
	};
})
.controller("juciInputIpv4Address", function($scope, $attrs, $parse, $uci){
	$scope.data = { parts: [ "0", "0", "0", "0" ] };
	$scope.placeholders = ["...","...","...","..."];

	var ngModel = $parse($attrs.ngModel);

	// extract model into the parts
	$scope.$watch("ngModel", function(value){
		if(value === undefined) return;
		var parts = value.split(".");
		$scope.data.parts = [];
		parts.forEach(function(v, i){
			$scope.data.parts[i] = v;
		});
		if($scope.placeholder && typeof $scope.placeholder == "string"){
			var validator = new $uci.validators.IP4AddressValidator();
			if(validator.validate({value:$scope.placeholder}) == null){
				$scope.placeholders = $scope.placeholder.split(".");
			}
		}
	},true);

	// reassemble model when parts change
	$scope.updateModel = function() {
		console.log("Assemble parts: "+$scope.data.parts);
		var ipaddr = Object.keys($scope.data.parts).map(function(x){ return $scope.data.parts[x] }).join(".");
		if($scope.ngModel != ipaddr) ngModel.assign($scope.$parent, ipaddr);
	};

	$scope.onPaste = function(ev){
		var ip = ev.originalEvent.clipboardData.getData('text/plain');
		if(!ip) return;
		var parts = ip.split(".");
		if(parts.length != 4) return;
		parts.forEach(function(v, i){ $scope.data.parts[i] = v; });
		$scope.updateModel();
	}
});

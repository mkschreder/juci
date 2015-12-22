/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Stefan Nygren <stefan.nygren@hiq.se>

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
.directive("dropbearSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/dropbear-settings-edit.html",
		scope: {
			dropbear: "=ngModel"
		},
		replace: true,
		controller: "dropbearSettingsEdit",
		require: "^ngModel"
	};
}).controller("dropbearSettingsEdit", function($scope, $rpc, $network){
	$network.getNetworks().done(function(res) {
		$scope.interfaces = res.map(function(x) { return {label:x[".name"].toUpperCase(),value:x[".name"]};});
		$scope.interfaces.push({label:"LOOPBACK",value:"loopback"});
		$scope.interfaces.push({label:"ANY",value:""});
		$scope.$apply();
	});
});


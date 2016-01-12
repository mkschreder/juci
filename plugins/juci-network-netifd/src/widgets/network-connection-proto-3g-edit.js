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
.directive("networkConnectionProto3gEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-3g-edit.html", 
		controller: "networkConnectionProto3gEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProto3gEdit", function($scope, $network, $modal, $tr, gettext){
	$scope.showPass = false;
	$scope.togglePasswd = function(){
		$scope.showPass = !$scope.showPass;
	};
	$rpc.juci.modems.list().done(function(data){
		$scope.allModemDevices = data.modems.map(function(x){return {label: x, value: x}});
		$scope.$apply();
	});
	$scope.serviceTypes = [
		{ label: $tr(gettext("UMTS/GPRS")),	value: "umts" },
		{ label: $tr(gettext("UMTS only")),	value: "umts_only" },
		{ label: $tr(gettext("GPRS only")),	value: "gprs_only" },
		{ label: $tr(gettext("GPRS only")),	value: "evdo" },
	];
})
.directive("networkConnectionProto3gAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-3g-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
}); 

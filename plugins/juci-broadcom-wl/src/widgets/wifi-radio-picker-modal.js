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
.controller("WifiRadioPickerModal", function($scope, $modalInstance, $wireless, interfaces, $tr, gettext){
	$scope.data = {}; 
	$scope.interfaces = interfaces; 
	
	$scope.allModes = [
		{ label: $tr(gettext("Access Point (AP)")), value: "ap" }, 
		{ label: $tr(gettext("Client (STA)")), value: "sta" }
	]; 
	
	$wireless.getDevices().done(function(devices){
		$scope.allRadios = devices.map(function(x){
			return { label: x[".frequency"] + " (" + x[".name"] + ")", value: x[".name"] }; 
		}); 
	}); 
  $scope.ok = function () {
		$scope.errors = []; 
		if(($scope.interfaces.find(function(x){ return x.ssid.value == $scope.data.ssid && x.device.value == $scope.data.radio; }) && !confirm(gettext("Are you sure you want to create a new SSID with the same name and on the same radio? This may result in undefined behaviour!")))){
			return;
		} 
		if(!$scope.data.radio){
			$scope.errors.push("Please select a radio!"); 
		} 
		if(!$scope.data.ssid || $scope.data.ssid == ""){
			$scope.errors.push("SSID can not be empty!"); 
		}
		if(!$scope.errors.length) {
			$modalInstance.close($scope.data);
		}
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
})

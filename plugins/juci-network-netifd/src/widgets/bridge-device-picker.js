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
.controller("bridgeDevicePicker", function($scope, $modalInstance, devices, gettext){
	$scope.devices = devices; 
	$scope.data = {}; 
	$scope.ok = function () {
		if(!$scope.data.device) {
			alert(gettext("You need to select a device to add!")); 
			return; 
		}
		$modalInstance.close($scope.data.device);
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
})

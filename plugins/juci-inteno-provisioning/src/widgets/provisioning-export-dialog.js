/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

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
.directive("provisioningExportDialog", function(){
	return {
		templateUrl: "/widgets/provisioning-export-dialog.html",
		scope: {
			model: "=ngModel"
		},
		require: "^ngModel",
		controller: "provisionExportDialogCtrl"
	};
}).controller("provisionExportDialogCtrl", function($scope){
	$scope.showPassword = false;
	$scope.model.value = "";
	$scope.model.doubble = "";
	$scope.model.show_error = false;
	$scope.togglePasswd = function(){
		$scope.showPassword = !$scope.showPassword;
	};
	$scope.update = function(){
		if($scope.model.doubble == "") return;
		if($scope.model.doubble == $scope.model.value) return 'has-success';
		return 'has-error';
	}
});

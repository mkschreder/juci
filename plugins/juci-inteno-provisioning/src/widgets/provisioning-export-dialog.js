//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

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

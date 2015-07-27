//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("bridgeDevicePicker", function($scope, $modalInstance, $wireless, devices, gettext){
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

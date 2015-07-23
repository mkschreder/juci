//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiRadioPickerModal", function($scope, $modalInstance, $wireless, interfaces){
	$scope.data = {}; 
	$scope.interfaces = interfaces; 
	
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

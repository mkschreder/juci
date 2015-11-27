//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("DropbearSettings", function($scope, $uci, $systemService){
	$scope.data = {

	};
	$systemService.find("dropbear").done(function(service){
		$scope.service = service;
		$scope.$apply();
	});
	$uci.$sync("dropbear").done(function(){
		if($uci.dropbear && $uci.dropbear["@dropbear"].length){
			$scope.dropbear = $uci.dropbear["@dropbear"][0];
			$scope.$apply();
			console.log($scope.dropbear);
		}
	});
	$scope.onSave = function(){
		$uci.save();
	}
	$scope.onServiceEnableDisable = function(enabled){
		if(!$scope.service) return;
		if($scope.service.enabled){
			$scope.service.disable().always(function(){ $scope.$apply(); });
		} else {
			$scope.service.enable().always(function(){ $scope.$apply(); });
		}
	}
	$scope.onStartStopService = function(){
		if(!$scope.service) return;
		if($scope.service.running){
			$scope.service.stop().always(function(){ $scope.$apply(); });
		} else {
			$scope.service.start().always(function(){ $scope.$apply(); });
		}
	}
});

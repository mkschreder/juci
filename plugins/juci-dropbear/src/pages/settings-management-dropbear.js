//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("dropbearSettings", function($scope, $uci, $systemService, $network,$tr,gettext){
	$scope.data = {

	};
	$network.getNetworks().done(function(res) {
		$scope.interfaces=res.map(function(x) { return {label:x[".name"].toUpperCase(),value:x[".name"]};});
		$scope.interfaces.push({label:"LOOPBACK",value:"loopback"});
		$scope.interfaces.push({label:"ANY",value:""});
		$scope.$apply();

	});

	$systemService.find("dropbear").done(function(service){
		$scope.service = service;
		$scope.$apply();
	});
	$uci.$sync("dropbear").done(function(){
		if($uci.dropbear && $uci.dropbear["@dropbear"].length){
			$scope.dropbear = $uci.dropbear["@dropbear"];
			$scope.$apply();
		}
	});
	$scope.onSave = function() {
		$uci.save();
	}
	$scope.getTitle = function(cfg){
		return $tr(gettext("Dropbear Instance ")) + cfg[".name"];
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

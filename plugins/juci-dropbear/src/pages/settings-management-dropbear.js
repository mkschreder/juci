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
.controller("dropbearSettings", function($scope, $uci, $systemService, $network,$tr,gettext){
	$scope.data = {

	};
	
	$systemService.find("dropbear").done(function(service){
		$scope.service = service;
		$scope.$apply();
	});

	$uci.$sync("dropbear").done(function(){
		$scope.dropbear = []; 
		if($uci.dropbear){
			$scope.dropbear = $uci.dropbear["@dropbear"];
			$scope.$apply();
		}
	});
	
	$scope.getTitle = function(cfg){
		return $tr(gettext("Dropbear Instance on Interface: ")) + ((cfg.Interface.value != "") ? String(cfg.Interface.value).toUpperCase() : $tr(gettext("ANY"))) + " Port: " + cfg.Port.value;
	}

	$scope.onAddInstance = function(){
		$uci.dropbear.$create({
			".type":"dropbear",
		}).done(function() {
			$scope.$apply();
		});
	}
	$scope.onDeleteInstance = function(ins){
		if(!ins) alert($tr(gettext("Please select a instance in the list to remove")));
		if($scope.dropbear.length <= 0) {
			alert($tr(gettext("Unable to remove last instance")));
		} else {
		 	 if(confirm($tr(gettext("Are you sure you want to remove this instance?")))){
				ins.$delete().done(function(){
					$scope.$apply();
				});
		 	}
		}
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

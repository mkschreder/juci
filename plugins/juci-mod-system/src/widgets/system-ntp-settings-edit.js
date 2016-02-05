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
.directive("systemNtpSettingsEdit", function(){
	return {
		templateUrl: "/widgets/system-ntp-settings-edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "systemNtpSettingsEdit", 
		replace: true
	 };  
})
.controller("systemNtpSettingsEdit", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync("system").done(function(){
		if(!$uci.system.ntp) return; 
		$scope.ntp = $uci.system.ntp.server.value.map(function(x){ return { server: x }; }); 
		$scope.$apply(); 
		$scope.$watch("ntp", function onSystemNTPChanged(){
			$uci.system.ntp.server.value = []; 
			$scope.ntp.map(function(ntp){
				$uci.system.ntp.server.value.push(ntp.server); 
			}); 
		}, true); 
	}); 
	$scope.onDeleteNTPServer = function(ntp){
		$scope.ntp = $scope.ntp.filter(function(x){ return x != ntp; }); 
	}
	$scope.onAddNTPServer = function(){
		if(!$uci.system.ntp) return; 
		$scope.ntp.push({ server: "" }); 
	}
}); 

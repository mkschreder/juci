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
.controller("broadcomPowerMgmtConfigPage", function($scope, $tr, gettext, $uci){
	$uci.$sync(["power_mgmt"]).done(function(){
		$scope.pwr = $uci.power_mgmt.power_mgmt;		
	});
	$scope.cpu_speeds = [
		{ label: $tr(gettext("1/1 Sync")),			value: 0 },
		{ label: $tr(gettext("full speed Async")),	value: 1 },
		{ label: $tr(gettext("1/2 speed Async")),	value: 2 },
		{ label: $tr(gettext("1/4 speed Async")),	value: 4 },
		{ label: $tr(gettext("1/8 speed Async")),	value: 8 },
		{ label: $tr(gettext("1/8 Async when entering wait, 1/1 Sync otherwise")),	value: 256 },
	];
	$scope.$watch("pwr.cpur4kwait.value", function() {
		if(!$scope.pwr) return;
		if(!$scope.pwr.cpur4kwait.value){
			$scope.pwr.sr.value = false;
		}
	}, true)
}); 

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("broadcomPowerMgmtConfigPage", function($scope, $tr, gettext, $uci){
	$uci.$sync(["power_mgmt"]).done(function(){
		$scope.pwr = $uci.power_mgmt.power_mgmt;		
		console.log($scope.pwr);
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

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("icwmpProvisioningPage", function($scope, $tr, gettext, $uci){
	$scope.settings = {
		general_enabled: false
	}
	$uci.$sync(["provisioning"]).done(function(){
		$scope.general = $uci.provisioning.polling;
		console.log($scope.general.enabled.value);
		$scope.settings.general_enabled = (($scope.general.enabled.value === 'on') ? true:false);
		console.log($scope.settings.general_enabled);
		$scope.prov_server = $uci.provisioning.configserver;
		$scope.dhcp_server = $uci.provisioning.iup;
		$scope.upgrade_server = $uci.provisioning.upgradeserver;
		$scope.subconfigs = $uci.provisioning["@subconfig"];
		$scope.$apply();
	});
	$scope.times = [];
	for(var i = 100; i < 124; i++){$scope.times[i-100] = { label: i.toString().substr(-2), value: i.toString().substr(-2) }};
	$scope.update_interval = [
		{ label: $tr(gettext("Hourly")),	value: "hourly" },
		{ label: $tr(gettext("Daily")),	value: "daily" },
		{ label: $tr(gettext("Weekly")),	value: "weekly" }
	];
}); 

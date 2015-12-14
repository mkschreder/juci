//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("icwmpConfigPage", function($scope, $uci, $tr, gettext, $network){
	$uci.$sync(["cwmp"]).done(function(){
		$scope.acs = $uci.cwmp.acs;
		$scope.cpe = $uci.cwmp.cpe;
	});
	$network.getWanNetworks().done(function(networks){
		console.log(networks);
		$scope.wan_interfaces = networks.map(function(n){
			return { label: String(n[".name"]).toUpperCase(), value: n[".name"] };
		});
		$scope.$apply();
	});
	$scope.bool = [
		{ label: $tr(gettext("Enabled")), 	value: 'enable' },
		{ label: $tr(gettext("Disabled")),	value: 'disable' }
	];
	$scope.severity_levels = [
		{ label: $tr(gettext("Emergency")),	value: 'EMERG' },
		{ label: $tr(gettext("Alert")),		value: 'ALERT' },
		{ label: $tr(gettext("Critical")),	value: 'CRITIC' },
		{ label: $tr(gettext("Error")),		value: 'ERROR' },
		{ label: $tr(gettext("Warning")),	value: 'WARNING' },
		{ label: $tr(gettext("Notice")),	value: 'NOTICE' },
		{ label: $tr(gettext("Info")),		value: 'INFO' },
		{ label: $tr(gettext("Debug")),		value: 'DEBUG' }
	];
});

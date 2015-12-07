//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("icwmpProvisioningPage", function($scope, $tr, gettext, $uci, $juciDialog){
	$scope.settings = {
		general_enabled: false,
		prov_server_enabled: false,
		prov_server_reboot: false,
		dhcp_server_enabled: false,
		uppgrade_server_enabled: false
	}
	$scope.showPasswd = false;
	$scope.togglepw = function(){$scope.showPasswd = !$scope.showPasswd;};
	$uci.$sync(["provisioning"]).done(function(){
		$scope.general = $uci.provisioning.polling;
		console.log($scope.general.enabled.value);
		$scope.settings.general_enabled = (($scope.general.enabled.value === 'on') ? true:false);
		$scope.prov_server = $uci.provisioning.configserver;
		$scope.settings.prov_server_enabled = (($scope.prov_server.enabled.value == 'on') ? true:false);
		$scope.settings.prov_server_reboot = (($scope.prov_server.reboot.value == 'on') ? true:false);
		$scope.dhcp_server = $uci.provisioning.iup;
		$scope.settings.dhcp_server_enabled = (($scope.dhcp_server.enabled.value == 'on') ? true:false);
		$scope.uppgrade_server = $uci.provisioning.uppgradeserver;
		$scope.settings.uppgrade_server_enabled = (($scope.uppgrade_server.enabled.value == 'on') ? true:false);
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
	$scope.onExportFile = function() {
		var model = {};
		$juciDialog.show("provisioning-export-dialog", {     
            title: $tr(gettext("Add password protection")),
            model: model,
            on_apply: function(btn, dlg){                
				if(model.value != model.doubble){
					model.show_error = true;
					return false;
				}
				window.location = "/cgi-bin/juci-iup-download?sid=" + $rpc.$sid();
                return true;
            }   
        });
	
	};
	$scope.$watch("settings", function(){
		if(!$scope.settings || !$scope.general || !$scope.prov_server) return;
		$scope.general.enabled.value = (($scope.settings.general_enabled) ? 'on': 'off');
		$scope.prov_server.enabled.value = (($scope.settings.prov_server_enabled) ? 'on': 'off');
		$scope.prov_server.reboot.value = (($scope.settings.prov_server_reboot) ? 'on': 'off');
		$scope.dhcp_server.enabled.value = (($scope.settings.dhcp_server_enabled) ? 'on': 'off');
		$scope.uppgrade_server.enabled.value = (($scope.settings.uppgrade_server_enabled) ? 'on': 'off');
	}, true);
}); 

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
.controller("icwmpProvisioningPage", function($scope, $tr, gettext, $uci, $juciDialog){
	$scope.showPasswd = false;
	$scope.togglepw = function(){$scope.showPasswd = !$scope.showPasswd;};
	$uci.$sync(["provisioning"]).done(function(){
		$scope.general = $uci.provisioning.polling;
		console.log($scope.general.enabled.value);
		$scope.prov_server = $uci.provisioning.configserver;
		$scope.dhcp_server = $uci.provisioning.iup;
		$scope.uppgrade_server = $uci.provisioning.uppgradeserver;
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
	$scope.onDeleteConf = function(config){
		if(!config) return;
		config.$delete().done(function(){
			$scope.$apply();
		});
	};
	$scope.onAddConf = function(config){
		$uci.provisioning.$create({
			".type": "subconfig",
			"enabled":"off"
		}).done(function(){
			$scope.$apply();
		});
	};
	$scope.onExportFile = function() {
		window.location = "/cgi-bin/juci-iup-download?sid=" + $rpc.$sid();
	/*	var model = {};
		$juciDialog.show("provisioning-export-dialog", {     
            title: $tr(gettext("Add password protection")),
            model: model,
            on_apply: function(btn, dlg){                
				if(model.value != model.doubble){
					model.show_error = true;
					return false;
				}
                return true;
            }   
        });
	*/
	};
}); 

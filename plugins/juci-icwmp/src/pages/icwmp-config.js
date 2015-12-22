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

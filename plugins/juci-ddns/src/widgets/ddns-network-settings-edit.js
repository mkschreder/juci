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
.directive("ddnsNetworkSettingsEdit", function($compile){
	return {
		scope: {
			ddns: "=ngModel"
		}, 
		templateUrl: "/widgets/ddns-network-settings-edit.html", 
		controller: "ddnsNetworkSettingsEdit"
	};
})
.controller("ddnsNetworkSettingsEdit", function($scope, $rpc, $tr, gettext, $ethernet, $network){
	$scope.allSourceTypes = [
		{ label: $tr(gettext("Interface")), value: "interface" }, 
		{ label: $tr(gettext("Network")), value: "network" }, 
		{ label: $tr(gettext("Script")), value: "script" }, 
		{ label: $tr(gettext("Web")), value: "web" }
	]; 
	$ethernet.getAdapters().done(function(adapters){
		$scope.allSourceDevices = adapters.map(function(a){
			return { label: a.name, value: a.device }; 
		}); 
		$scope.$apply(); 
	});
	$network.getNetworks().done(function(nets){
		$scope.allSourceNetworks = nets.map(function(n){
			return { label: n[".name"], value: n[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	$rpc.juci.ddns.providers().done(function(result){
		if(!result || !result.providers) return; 
		$scope.allServices = result.providers.map(function(p){ return { label: p, value: p }}); 
		$scope.$apply(); 
	});
}); 

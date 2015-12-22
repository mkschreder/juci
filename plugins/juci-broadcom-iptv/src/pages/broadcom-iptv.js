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
.controller("PageBroadcomIptv", function($scope, $tr, $uci, gettext, $ethernet, $network){
	$scope.networks = {
		selected_wan: [],
		selected_lan: []
	};
	$uci.$sync("mcpd").done(function(){
		$scope.loaded = true; 
		if(!$uci.mcpd.mcpd) {
			$scope.$apply(); 
			return; 
		}
		$scope.mcpd = $uci.mcpd.mcpd;
		var proxy_interfaces = $scope.mcpd.igmp_proxy_interfaces.value.split(" ");
		var snooping_interfaces = $scope.mcpd.igmp_snooping_interfaces.value.split(" ");
		$ethernet.getAdapters().done(function(devs){
			$scope.networks.lan = devs.map(function(dev){
				return {
					name:dev.device,
					ticked: (snooping_interfaces.indexOf(dev.device) > -1)
				}
			});
			$scope.$apply();
		});
		$network.getNetworks().done(function(nets){
			$scope.networks.wan = nets.map(function(net){
				return { 
					name:net[".name"], 
					ticked: (proxy_interfaces.indexOf(net[".name"]) > -1)
				}
			});
			$scope.$apply(); 
		});
	}); 
	$scope.$watch('networks', function(){
		if(!$scope.networks.selected_wan || !$scope.networks.selected_lan || !$scope.mcpd) return;
		$scope.mcpd.igmp_proxy_interfaces.value = $scope.networks.selected_wan.map(function(x){return x.name}).join(" ");	
		$scope.mcpd.igmp_snooping_interfaces.value = $scope.networks.selected_lan.map(function(x){return x.name}).join(" ");
	}, true);
	$scope.DSCP = [
		{ label: $tr(gettext("No DSCP")),									value: "" },
		{ label: $tr(gettext("Standard (CS0)")),							value: "CS0" },
		{ label: $tr(gettext("Low-Priority Data")),							value: "CS1" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF11)",			value: "AF11" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF12)",			value: "AF12" },
		{ label: $tr(gettext("High-Throughput Data")) + " (AF13)",			value: "AF13" },
		{ label: $tr(gettext("Operation, Administration and Maintenance")),	value: "CS2" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF21)",				value: "AF21" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF22)",				value: "AF22" },
		{ label: $tr(gettext("Low-Latency Data")) + " (AF23)",				value: "AF23" },
		{ label: $tr(gettext("Broadcast Video")),							value: "CS3" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF31)",			value: "AF31" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF32)",			value: "AF32" },
		{ label: $tr(gettext("Multimedia Streamingi")) + " (AF33)",			value: "AF33" },
		{ label: $tr(gettext("Realtime Interactive")),						value: "CS4" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF41)",		value: "AF41" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF42)",		value: "AF42" },
		{ label: $tr(gettext("Multimedia Conferencing")) + " (AF43)",		value: "AF43" },
		{ label: $tr(gettext("Signaling")),									value: "CS5" },
		{ label: $tr(gettext("Telephony")),									value: "EF" },
		{ label: $tr(gettext("Network Control")),							value: "CS6" }
	];
	$scope.default_version = [1,2,3].map(function(x){ return { label: $tr(gettext("IGMP version ")) +x, value: x }; });  
	$scope.snooping_mode = [
		{ label: $tr(gettext("Disabled")),	value:0 },
		{ label: $tr(gettext("Standard")),	value:1 },
		{ label: $tr(gettext("Blocking")),	value:2 },
	];
}); 

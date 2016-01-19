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
.directive("uciFirewallNatRuleEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/uci.firewall.nat.rule.edit.html", 
		scope: {
			rule: "=ngModel"
		}, 
		controller: "uciFirewallNatRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallNatRuleEdit", function($scope, $uci, $rpc, $firewall, $network, $log){
	$scope.portIsRange = 0;
	$scope.data = {}; 
	$scope.$watch("rule", function(value){
		if(!value) return;
		// TODO: why does rule all of a sudden gets value that is not a uci sectioN??
		if(!value[".config"]) { 
			console.error("nat-rule-edit: invalid ngModel! must be config section! "+Object.keys(value)); 
			return; 
		}
		$scope.data.src_ip_enabled = (value.src_ip.value)?true:false; 
		if(value.src_dport.value && value.dest_port.value){	
			$scope.portIsRange = (value.src_dport.value.indexOf("-") != -1) || (value.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.$watch("data.src_ip_enabled", function(value){
		if($scope.rule && value == false) $scope.rule.src_ip.value = ""; 
	}); 

	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"}, 
		{ label: "TCP", value: "tcp"}, 
		{ label: "TCP + UDP", value: "tcpudp" }
	]; 
	$scope.deviceChoices = [];
	$firewall.getZones().done(function(zones){
		$scope.allZones = zones.map(function(x){ return { label: x.name.value.toUpperCase(), value: x.name.value } }); 
		$network.getConnectedClients().done(function(clients){
			var choices = []; 
			clients.map(function(c) {
				choices.push({
					label: (c.hostname && c.hostname.length)?c.hostname:c.ipaddr, 
					value: c.ipaddr
				}); 
			}); 
			$scope.deviceChoices = choices; 
			$scope.$apply(); 
		});
	}); 
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 

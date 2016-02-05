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
.directive("uciFirewallRuleEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/uci.firewall.rule.edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "uciFirewallRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallRuleEdit", function($scope, $uci, $rpc, $network, $log, $tr, gettext){
	$scope.$watch("ngModel", function onFirewallRuleModelChanged(value){
		if(!value) return; 
		var ngModel = value; 
		if(ngModel && ngModel.src_dport && ngModel.dest_port && ngModel.src_dport.value && ngModel.dest_port.value){
			$scope.portIsRange = (ngModel.src_dport.value.indexOf("-") != -1) || (ngModel.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.protocolChoices = [
		{ label: $tr(gettext("UDP")), value: "udp" }, 
		{ label: $tr(gettext("TCP")), value: "tcp" }, 
		{ label: $tr(gettext("TCP + UDP")), value: "tcpudp" }
	]; 
	$scope.rangeTypes = [
		[false, $tr(gettext('Port'))], 
		[true, $tr(gettext('Port range'))]
	]; 
	
	$scope.deviceChoices = [];
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
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 

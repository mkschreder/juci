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
.directive("firewallRuleEdit", function(){
	return {
		scope: {
			rule: "=ngModel"
		}, 
		controller: "firewallRuleEdit", 
		templateUrl: "/widgets/firewall-rule-edit.html"
	}; 
})
.controller("firewallRuleEdit", function($scope, $firewall, gettext, $tr, $network, networkHostPicker){
	
	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"}, 
		{ label: "TCP", value: "tcp"}, 
		{ label: "ICMP", value: "icmp"}, 
		{ label: "TCP + UDP", value: "tcpudp" },
		{ label: "ESP", value: "esp" }
	]; 
	
	$scope.familyChoices = [
		{ label: "Any", value: "any" },
		{ label: "IPv4", value: "ipv4"}, 
		{ label: "IPv6", value: "ipv6"}
	]; 
	$scope.targetChoices = [
		{ label: gettext("ACCEPT"), value: "ACCEPT" }, 
		{ label: gettext("REJECT"), value: "REJECT" }, 
		{ label: gettext("FORWARD"), value: "FORWARD" },
		{ label: gettext("DROP"), value: "DROP" }
	]; 
	
	$firewall.getZones().done(function(zones){
		$scope.allZones = []; 
		$scope.allZones.push({ label: $tr(gettext("Unspecified")), value: "" }); 
		$scope.allZones.push({ label: $tr(gettext("Any")), value: "*" }); 
		zones.map(function(x){
			$scope.allZones.push({ label: String(x.name.value).toUpperCase(), value: x.name.value }); 
		}); 
	}); 
	
	function update(){
		var rule = $scope.rule; 
		if(!rule || !rule.src_ip) return; 
		$scope.data = {
			src_ip_enabled: rule.src_ip.value != "", 
			src_mac_enabled: rule.src_mac.value != "", 
			src_port_enabled: rule.src_port.value != "", 
			dest_ip_enabled: rule.dest_ip.value != "", 
			dest_mac_enabled: rule.dest_mac.value != "", 
			dest_port_enabled: rule.dest_port.value != ""
		};
		// clear a field if user unclicks the checkbox
		Object.keys($scope.data).map(function(k){
			$scope.$watch("data."+k, function onFirewallRuleEnabledChanged(value){
				var field = k.replace("_enabled", ""); 
				if(!value && $scope.rule) $scope.rule[field].value = ""; 
			}); 
		}); 
		setTimeout(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onSelectSrcHost = function(){
		if(!$scope.rule) return; 
		networkHostPicker.show({ net: $scope.rule.src.value }).done(function(client){
			$scope.rule.src_ip.value = client.ipaddr; 
			$scope.rule.src_mac.value = client.macaddr; 
			update(); 
		}); 
	}
	
	$scope.onSelectDestHost = function(){
		if(!$scope.rule) return; 
		networkHostPicker.show({ net: $scope.rule.dest.value }).done(function(client){
			$scope.rule.dest_ip.value = client.ipaddr; 
			$scope.rule.dest_mac.value = client.macaddr; 
			update(); 
		}); 
	}
	
	$scope.$watch("rule", function onFirewallRuleModelChanged(rule){
		if(!rule) return; 
		update(); 
	}); 
}); 

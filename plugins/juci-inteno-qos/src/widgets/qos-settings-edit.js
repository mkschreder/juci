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
.directive("qosSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/qos-settings-edit.html",
		scope: {
			rule: "=ngModel"
		},
		controller: "qosSettingsEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("qosSettingsEdit", function($scope, $uci, $tr, gettext, $network, intenoQos){
	$network.getConnectedClients().done(function(data){
		$scope.clients = data.map(function(x){
			return {label: x.ipaddr, value: x.ipaddr }
		});
		$scope.$apply();
	});
	intenoQos.getDefaultTargets().done(function(targets){
		$scope.targets = targets.map(function(x){ 
			return { label: x, value: x };
		});
		$scope.$apply();
	});
	var done = false;
	$scope.$watch("rule", function onQosSettingsRuleChanged(){
		if(!$scope.rule || done) return;
		done = true;
		$scope.ports = $scope.rule.ports.value.split(",").map(function(port){return {value: port }});
	}, false);

	$scope.precedence = [
		{ label: $tr(gettext("All")),	value: '' },
		{ label: '0',					value: '0' },
		{ label: '1',					value: '8 10 12 14' },
		{ label: '2',					value: '16 18 20 22' },
		{ label: '3',					value: '24 26 28 30' },
		{ label: '4',					value: '32 34 36 38' },
		{ label: '5',					value: '40 46' },
		{ label: '6',					value: '48' },
		{ label: '7',					value: '56' }
	];

	$scope.protocols = [
		{ label: $tr(gettext("All")),		value: '' },
		{ label: $tr(gettext("TCP")),		value: 'tcp' },
		{ label: $tr(gettext("UDP")),		value: 'udp' },
		{ label: $tr(gettext("ICMP")),		value: 'icmp' },
	];
});

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

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
.controller("qosSettingsEdit", function($scope, $uci, $tr, gettext, $network){
	$network.getConnectedClients().done(function(data){
		$scope.clients = data.map(function(x){
			return {label: x.ipaddr, value: x.ipaddr }
		});
		$scope.$apply();
	});
	
	$uci.$sync(["qos"]).done(function(){
		$scope.targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
			if(x == "Bulk") return { label: $tr(gettext("Low")), value: x };
			return { label: x, value: x };
		});
		$scope.$apply();
	});

	$scope.$watch("rule", function(){
		if(!$scope.rule) return;
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

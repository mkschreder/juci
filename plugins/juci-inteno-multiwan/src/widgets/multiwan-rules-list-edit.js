//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.directive("multiwanRulesList", function($compile, $parse){
	return {
		scope: {
			model: "=ngModel"
		},
		templateUrl: "/widgets/multiwan-rules-list.html",
		controller: "multiwanRulesListCtrl",
		replace: "true",
		require: "^ngModel"
	}
}).controller("multiwanRulesListCtrl", function($scope, $tr, gettext){
	$scope.protocols = [
		{ label: $tr(gettext("UDP")),	value: "udp" },
		{ label: $tr(gettext("TCP")),	value: "tcp" },
		{ label: $tr(gettext("ICMP")),	value: "icmp" }
	];
	$scope.wan_uplink = [
		{ label: $tr(gettext("LAN")),	value: "lan" },
		{ label: $tr(gettext("WAN")),	value: "wan" },
		{ label: $tr(gettext("WAN6")),	value: "wan6" },
		{ label: $tr(gettext("Load Balancer (Performance)")),	value: "fastbalncer" },
		{ label: $tr(gettext("Load Balancer (Compability)")),	value: "balancer" }
	];
});

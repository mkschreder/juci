//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionDnsConfig", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-dns-config.html",
		scope: {
			interface: "=ngModel"
		},
		controller: "networkConnectionDnsConfig",
		replace: true,
		require: "^ngModel"
	 };
})
.controller("networkConnectionDnsConfig", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.data = [];
	$scope.$watch("interface", function onNetworkDNSModelChanged(){
		if(!$scope.interface || !$scope.interface.dns) return;
		$scope.data = $scope.interface.dns.value.map(function(dns){
			return { value:dns}
		});
	}, false);
	$scope.addDns = function(dns){ $scope.data.push({ value: ""})};
	$scope.removeDns = function(index){ if($scope.data[index]) $scope.data.splice(index, 1);};
	$scope.$watch("data", function onNetworkDNSDataChanged(){
		if(!$scope.data || !$scope.interface || !$scope.interface.dns) return;
		$scope.interface.dns.value = $scope.data.map(function(x){ return x.value});
	}, true);
});

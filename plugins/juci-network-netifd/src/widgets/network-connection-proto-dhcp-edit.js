//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoDhcpEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-proto-dhcp-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoDhcpEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoDhcpEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.$watch("interface", function(value){
		if(!value) return; 
		$scope.data = {
			primaryDNS: value.dns.value[0] || "", 
			secondaryDNS: value.dns.value[1] || ""
		}; 
	}); 
	$scope.$watch("data.primaryDNS", function(value){
		if(!$scope.conn) return; 
		$scope.interface.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
	$scope.$watch("data.secondaryDNS", function(value){
		if(!$scope.conn) return; 
		$scope.interface.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
}); 

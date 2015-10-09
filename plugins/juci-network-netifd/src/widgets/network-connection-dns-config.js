//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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

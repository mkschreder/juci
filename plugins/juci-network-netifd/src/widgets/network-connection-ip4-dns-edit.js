JUCI.app
.directive("networkConnectionIp4DnsEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-ip4-dns-edit.html", 
		scope: {
			conn: "=ngModel"
		}, 
		controller: "networkConnectionIp4DnsEdit", 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionIp4DnsEdit", function($scope){
	$scope.$watch("conn", function(value){
		if(!value) return; 
		$scope.data = {
			primaryDNS: value.dns.value[0] || "", 
			secondaryDNS: value.dns.value[1] || ""
		}; 
	}); 
	$scope.$watch("data.primaryDNS", function(value){
		if(!$scope.conn) return; 
		$scope.conn.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
	$scope.$watch("data.secondaryDNS", function(value){
		if(!$scope.conn) return; 
		$scope.conn.dns.value = [$scope.data.primaryDNS, $scope.data.secondaryDNS]; 
	}); 
}); 

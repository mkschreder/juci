//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 

JUCI.app
.directive("networkConnectionProtoDhcpEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-dhcp-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoDhcpEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoDhcpEdit", function($scope, $uci, $network, $rpc, $log, gettext){
}).directive("networkConnectionProtoDhcpPhysicalEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-standard-physical.html",
		scope: {
			conn: "=ngModel",
			protos: "="
		},
		replace: true,
		require: "^ngModel"
	};
}).directive("networkConnectionProtoDhcpAdvancedEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-proto-dhcp-advanced-edit.html",
		scope: {
			interface: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "networkConnectionProtoDhcpAdvancedEditCtrl"
	};
}).controller("networkConnectionProtoDhcpAdvancedEditCtrl", function($scope){
	$scope.dnslist = [];
	$scope.$watch("interface", function(){
		if(!$scope.interface) return;
		$scope.interface.dns.value = $scope.interface.dns.value.filter(function(x){ return x != "" });
		$scope.dnslist = $scope.interface.dns.value.map(function(x){ return { text: x }});
	}, false);
	$scope.onTagsChange = function(){
		$scope.interface.dns.value = $scope.dnslist.map(function(x){return x.text;});
	};
	$scope.evalDns = function(tag){
		var parts = String(tag.text).split(".");
		if(parts.length != 4) return false;
		for(var i = 0; i < 4; i++){	
			var isnum = /^[0-9]+$/.test(parts[i]);
			if(!isnum) return false;
			var num = parseInt(parts[i]);
			if(num < 0 || num > 255) return false;
		}
		return true;
	};

});; 

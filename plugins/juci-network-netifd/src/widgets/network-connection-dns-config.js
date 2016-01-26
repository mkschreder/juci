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
	$scope.$watch("interface", function(){
		if(!$scope.interface || !$scope.interface.dns) return;
		$scope.data = $scope.interface.dns.value.map(function(dns){
			return { value:dns}
		});
		$scope.interface.dns.validator = new dnsValidator;
	}, false);
	var ipv4validator = new $uci.validators.IP4AddressValidator;
	function dnsValidator(){
		this.validate = function(data){
			if(data.value.find(function(dns){
				if( ipv4validator.validate({value:dns}) != null) return true;
				return false;
			}) != undefined) return "All DNS-servers must be valid";
			if(duplicatesInData()) return "All DNS-servers must be unique"
			return null;
		};
	};
	$scope.addDns = function(dns){ $scope.data.push({ value: ""})};
	$scope.removeDns = function(index){ if($scope.data[index]) $scope.data.splice(index, 1);};
	$scope.$watch("data", function(){
		if(!$scope.data || !$scope.interface || !$scope.interface.dns) return;
		$scope.interface.dns.value = $scope.data.map(function(x){ return x.value});
	}, true);
	function duplicatesInData(){
		var dnslist = $scope.data.map(function(x){ return x.value;});
		var sorted_list = dnslist.sort();
		for(var i = 0; i < sorted_list.length -1; i++){
			if(sorted_list[i+1] == sorted_list[i]) return true;
		}
		return false;
	};
});

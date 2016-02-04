//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionProtoStaticEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-static-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoStaticEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoStaticEdit", function($scope, $uci, $network, $rpc, $log, $tr, gettext){
	$scope.$watch("interface", function(){
		if(!$scope.interface) return;
		$scope.ip.type = ($scope.interface.ip6assign.value == "" ? "alloc" : "assign");
		$scope.interface.dns.value = $scope.interface.dns.value.filter(function(x){ if(x == "") return false; return true});;
		$scope.dnslist = $scope.interface.dns.value.map(function(x){return { text:x }});
	}); 
	$scope.interface_types = [
		{ label: $tr(gettext("Uplink")),	 value: false },
		{ label: $tr(gettext("Local Link")), value: true }
	];
	$scope.ip = {};
	$scope.ip.types = [
		{ label: $tr(gettext("Address Allocation")),	value: "alloc" },
		{ label: $tr(gettext("Address Assignment")),	value: "assign" }
	];
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
	$scope.onAssignChange = function(){
		var isnum = /^[0-9]+$/.test($scope.interface.ip6assign.value);
		while($scope.interface.ip6assign.value != "" && !isnum){
			$scope.interface.ip6assign.value = $scope.interface.ip6assign.value.slice(0, -1);	
		}
	};
	$scope.onAssignmentChange = function(value){
		if(value == "assign"){
			$scope.interface.ip6addr.value = "";
			$scope.interface.ip6gw.value = "";
			$scope.interface.ip6prefix.value = "";
		}else{
			$scope.interface.ip6hint.value = "";
			$scope.interface.ip6assign.value = "";
		}
	};
	
	$scope.$watchCollection("bridgedInterfaces", function(value){
		if(!value || !$scope.interface || !(value instanceof Array)) return; 
		$scope.interface.ifname.value = value.join(" "); 
	}); 
	
})
.directive("networkConnectionProtoStaticPhysicalEdit", function(){
	return {
		templateUrl: "/widgets/network-connection-standard-physical.html",
		scope: {
			interface: "=ngModel",
			protos: "="
		},
		replace: true,
		require: "^ngModel"
	};
});

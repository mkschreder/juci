//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoStaticEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-proto-static-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoStaticEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoStaticEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.$watch("interface", function(iface){
		if(!iface) return; 
		
	}); 
	
	$scope.$watchCollection("bridgedInterfaces", function(value){
		if(!value || !$scope.interface || !(value instanceof Array)) return; 
		$scope.interface.ifname.value = value.join(" "); 
	}); 
	
}); 

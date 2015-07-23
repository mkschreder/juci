JUCI.app
.directive("networkConnectionEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-edit.html", 
		scope: {
			conn: "=ngModel"
		}, 
		controller: "networkConnectionEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionEdit", function($scope, $uci, $network, $rpc, $log, gettext){
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

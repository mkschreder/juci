JUCI.app
.directive("networkConnectionIp4SettingsEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-ip4-settings-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionIp4SettingsEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionIp4SettingsEdit", function($scope, $uci, $network, $rpc, $log, gettext){
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

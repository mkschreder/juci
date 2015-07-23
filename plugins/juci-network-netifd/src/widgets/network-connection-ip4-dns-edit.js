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
	
}); 

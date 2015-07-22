//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

// this control gets pointer to network connection and looks up proper dhcp server entry for it. 

JUCI.app
.directive("networkConnectionDhcpServerSettings", function($compile){
	return {
		scope: {
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/network-connection-dhcp-server-settings.html", 
		controller: "networkConnectionDhcpServerSettings", 
		replace: true
	};  
})
.controller("networkConnectionDhcpServerSettings", function($scope, $network, $uci){
	$scope.dhcpEnabled = false; 
	$scope.$watch("connection", function(value){
		if(!value) return; 
		$uci.sync("dhcp").done(function(){
			$scope.dhcp = $uci.dhcp["@dhcp"].find(function(x){
				return x.interface.value == value[".name"]; 
			}); 
			$scope.dhcpEnabled = $scope.dhcp && !$scope.dhcp.ignore.value; 
			$scope.$apply(); 
		}); 
	}); 
	$scope.$watch("dhcpEnabled", function(value){
		if(!$scope.dhcp) return; 
		$scope.dhcp.ignore.value = value; 
	}); 
}); 

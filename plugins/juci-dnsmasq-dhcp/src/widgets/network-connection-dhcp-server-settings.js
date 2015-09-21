//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

// this control gets pointer to network connection and looks up proper dhcp server entry for it. 

JUCI.app
.directive("networkConnectionDhcpServerSettings", function($compile){
	return {
		scope: {
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/network-connection-dhcp-server-settings.html", 
		controller: "networkConnectionDhcpServerSettings"
	};  
})
.controller("networkConnectionDhcpServerSettings", function($scope, $network, $uci){
	$scope.data = {}; 
	$scope.data.dhcpEnabled = false; 
	$scope.$watch("connection", function(value){
		if(!value) return; 
		$uci.sync("dhcp").done(function(){
			$scope.dhcp = $uci.dhcp["@dhcp"].find(function(x){
				return x.interface.value == value[".name"] || x[".name"] == value[".name"]; 
			}); 
			$scope.data.dhcpEnabled = $scope.dhcp && !$scope.dhcp.ignore.value; 
			$scope.$apply(); 
		}); 
	}); 
	$scope.$watch("data.dhcpEnabled", function(value){
		if(!$scope.dhcp) {
			if($scope.connection){
				$uci.dhcp.create({
					".type": "dhcp", 
					".name": $scope.connection[".name"],
					"interface": $scope.connection[".name"],
					"ignore": !value
				}).done(function(dhcp){
					$scope.dhcp = dhcp; 
					$scope.$apply(); 
				}); 
			}
		} else {
			$scope.dhcp.ignore.value = !value; 
		}
	}); 
}); 

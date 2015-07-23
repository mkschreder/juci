//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("dhcpEntryEdit", function($compile){
	return {
		scope: {
			dhcp: "=ngModel"
		}, 
		templateUrl: "/widgets/dhcp-entry-edit.html", 
		controller: "dhcpEntryEdit", 
		replace: true
	};  
})
.controller("dhcpEntryEdit", function($scope, $network){
	$network.getNetworks().done(function(nets){
		$scope.availableNetworks = nets.map(function(n){
			return { label: n[".name"], value: n[".name"] }; 
		}); 
	}); 
}); 

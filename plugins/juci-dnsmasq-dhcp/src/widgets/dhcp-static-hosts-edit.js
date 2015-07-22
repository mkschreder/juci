//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("dhcpStaticHostsEdit", function($compile){
	return {
		scope: {
			dhcp: "=ngModel"
		}, 
		templateUrl: "/widgets/dhcp-static-hosts-edit.html", 
		controller: "dhcpStaticHostsEdit", 
		replace: true
	};  
})
.controller("dhcpStaticHostsEdit", function($scope, $network){
	
}); 

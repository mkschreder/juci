//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("dhcpBasicSettingsEdit", function($compile){
	return {
		scope: {
			dhcp: "=ngModel", 
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/dhcp-basic-settings-edit.html", 
		controller: "dhcpBasicSettingsEdit", 
		replace: true
	};  
})
.controller("dhcpBasicSettingsEdit", function($scope, $network){
	
	$scope.dhcpLeaseTimes = [
		{ label: "1 "+gettext("Hour"), value: "1h" }, 
		{ label: "6 "+gettext("Hours"), value: "6h" }, 
		{ label: "12 "+gettext("Hours"), value: "12h" }, 
		{ label: "24 "+gettext("Hours"), value: "24h" }, 
		{ label: gettext("Forever"), value: "24h" } // TODO: implement this on server side
	];  
	
}); 

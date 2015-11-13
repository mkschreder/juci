//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("dhcpBasicSettingsEdit", function($compile){
	return {
		scope: {
			dhcp: "=ngModel", 
			connection: "=ngConnection"
		}, 
		templateUrl: "/widgets/dhcp-basic-settings-edit.html", 
		controller: "dhcpBasicSettingsEdit"
	};  
})
.controller("dhcpBasicSettingsEdit", function($scope, $network, $tr, gettext){
	
	$scope.dhcpLeaseTimes = [
		{ label: "5 "+$tr(gettext("Minutes")), value: "5m"}, 
		{ label: "30 "+$tr(gettext("Minutes")), value: "30m"}, 
		{ label: "1 "+$tr(gettext("Hour")), value: "1h" }, 
		{ label: "6 "+$tr(gettext("Hours")), value: "6h" }, 
		{ label: "12 "+$tr(gettext("Hours")), value: "12h" }, 
		{ label: "24 "+$tr(gettext("Hours")), value: "24h" }, 
	];  
	
}); 

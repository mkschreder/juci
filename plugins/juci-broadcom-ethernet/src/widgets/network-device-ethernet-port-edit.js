//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceEthernetPortEdit", function($compile){
	return {
		scope: {
			port: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-ethernet-port-edit.html", 
		controller: "networkDeviceEthernetPortEdit", 
		replace: true
	};  
})
.controller("networkDeviceEthernetPortEdit", function($scope, gettext, $tr){
	$scope.speeds = [
		{ label: $tr(gettext("Full auto-negotiation")), 					value: "auto" }, 
		{ label: $tr(gettext("Max 100Mb auto-negotiation, full duplex")), 	value: "100FDAUTO" },
		{ label: $tr(gettext("Max 100Mb auto-negotiation, half duplex")), 	value: "100HDAUTO" },
		{ label: $tr(gettext("Max 10Mb auto-negotiation, full duplex")), 	value: "10FDAUTO" },
		{ label: $tr(gettext("Max 10Mb auto-negotiation, half duplex")), 	value: "10HDAUTO" },
		{ label: $tr(gettext("Only 100Mb, full duplex")), 					value: "100FD" },
		{ label: $tr(gettext("Only 100Mb, half duplex")), 					value: "100HD" },
		{ label: $tr(gettext("Only 10Mb, full duplex")), 					value: "10FD" },
		{ label: $tr(gettext("Only 10Mb, half duplex")), 					value: "10HD" }, 
		{ label: $tr(gettext("Disabled")), 									value: "disabled" }
	]; 
}); 

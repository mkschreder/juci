/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

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

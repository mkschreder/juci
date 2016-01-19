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
.controller("simpleWANConfigPage", function($scope, $uci, $tr, gettext){
	$scope.wan = {}; 
	$scope.loaded = false; 

	$uci.$sync("network").done(function(){
		$scope.wan = $uci.network.wan; 
		$scope.wan6 = $uci.network.wan6; 
		$scope.editor = "<network-connection-proto-"+$scope.wan.proto.value+"-edit ng-model='wan'/>"; 
		$scope.editor6 = "<network-connection-proto-"+$scope.wan6.proto.value+"-edit ng-model='wan6'/>"; 
		$scope.loaded = true; 
		$scope.$apply(); 
	}); 
		
	$scope.protocolTypes = [
		{ label: $tr(gettext("Static Address")), value: "static" }, 
		{ label: $tr(gettext("DHCP v4")), value: "dhcp" }, 
		{ label: $tr(gettext("DHCP v6")), value: "dhcpv6" }, 
		{ label: $tr(gettext("PPP over Ethernet")), value: "pppoe" } 
	]; 
		
	$scope.protocolTypes6 = [
		{ label: $tr(gettext("Static Address")), value: "static" }, 
		{ label: $tr(gettext("DHCP v6")), value: "dhcpv6" }, 
	]; 

	$scope.$watch("wan.proto.value", function(value){
		if(!$scope.wan.proto) return; 
		$scope.editor = "<network-connection-proto-"+$scope.wan.proto.value+"-edit ng-model='wan'/>"; 
	}); 

	$scope.$watch("wan6.proto.value", function(value){
		if(!value) return; 
		$scope.editor6 = "<network-connection-proto-"+value+"-edit ng-model='wan6'/>"; 
	}); 

}); 

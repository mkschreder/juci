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
.directive("networkConnectionEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-edit.html", 
		scope: {
			conn: "=ngModel"
		}, 
		controller: "networkConnectionEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionEdit", function($scope, $uci, $network, $rpc, $log, $tr, gettext, $juciDialog){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.allInterfaceTypes = [
		{ label: $tr(gettext("Standard")), value: "" }, 
		{ label: $tr(gettext("AnyWAN")), value: "anywan" }, 
		{ label: $tr(gettext("Bridge")), value: "bridge" }
	]; 
	 $scope.showPhysical = function(){
	 	if(!$scope.conn) return false;
	 	return $scope.allProtocolTypes.find(function(x){ if(x.value == $scope.conn.proto.value) return x.physical;}) != undefined;
	};
	
	$scope.allProtocolTypes = [
		{ label: $tr(gettext("Static Address")), 						value: "static",	physical: true }, 
		{ label: $tr(gettext("DHCP v4")), 								value: "dhcp",		physical: true }, 
		{ label: $tr(gettext("DHCP v6")), 								value: "dhcpv6",	physical: true }, 
		{ label: $tr(gettext("PPP")), 									value: "ppp",		physical: false }, 
		{ label: $tr(gettext("PPP over Ethernet")), 					value: "pppoe", 	physical: true }, 
		{ label: $tr(gettext("PPP over ATM")), 							value: "pppoa", 	physical: true }, 
		{ label: $tr(gettext("3G (ppp over GPRS/EvDO/CDMA or UTMS)")), 	value: "3g", 		physical: false }, 
		{ label: $tr(gettext("4G (LTE/HSPA+)")), 						value: "4g", 		physical: false }, 
		{ label: $tr(gettext("QMI (USB modem)")), 						value: "qmi", 		physical: true }, 
		{ label: $tr(gettext("NCM (USB modem)")), 						value: "ncm", 		physical: true }, 
		{ label: $tr(gettext("HNET (self-managing home network)")), 	value: "hnet", 		physical: true }, 
		{ label: $tr(gettext("Point-to-Point Tunnel")), 				value: "pptp", 		physical: false }, 
		{ label: $tr(gettext("IPv6 tunnel in IPv4 (6in4)")), 			value: "6in4", 		physical: false }, 
		{ label: $tr(gettext("IPv6 tunnel in IPv4 (6to4)")), 			value: "6to4", 		physical: false }, 
		{ label: $tr(gettext("Automatic IPv6 Connectivity Client")),	value: "aiccu", 	physical: false }, 
		{ label: $tr(gettext("IPv6 rapid deployment")), 				value: "6rd", 		physical: false }, 
		{ label: $tr(gettext("Dual-Stack Lite")), 						value: "dslite", 	physical: false }, 
		{ label: $tr(gettext("PPP over L2TP")), 						value: "l2tp", 		physical: false }, 
		{ label: $tr(gettext("Relayd Pseudo Bridge")),					value: "relay", 	physical: true }, 
		{ label: $tr(gettext("GRE Tunnel over IPv4")), 					value: "gre", 		physical: true }, 
		{ label: $tr(gettext("Ethernet GRE over IPv4")), 				value: "gretap", 	physical: true }, 
		{ label: $tr(gettext("GRE Tunnel over IPv6")), 					value: "grev6", 	physical: true }, 
		{ label: $tr(gettext("Ethernet GRE over IPv6")), 				value: "grev6tap", 	physical: true },
	]; 
	$rpc.juci.network.lua.protocols().done(function(data){
		$scope.protocolTypes = $scope.allProtocolTypes.filter(function(x){
			if(x.value == "static") return true;
			return data.protocols.find(function(p){ return p == x.value }) != undefined;
		});
	});

	$scope.ifstatus = function(){
		if(!$scope.conn || !$scope.conn.$info || $scope.conn.$info.pending == undefined || $scope.conn.$info.up == undefined) return $tr(gettext("ERROR"));
		return ($scope.conn.$info.pending) ? $tr(gettext("PENDING")) : (($scope.conn.$info.up) ? $tr(gettext("UP")) : $tr(gettext("DOWN")));
	};
	$scope.onChangeProtocol = function(value, oldvalue){
		if(confirm($tr(gettext("Are you sure you want to switch? Your settings will be lost!")))){
			var name = $scope.conn[".name"];
			$scope.conn.$delete().always(function(){
				$uci.network.$create({".name": name, ".type":"interface", "proto": value}).always(function(){
					$scope.$apply();
				});
			});
			return true;
		}
		return false;
	};

	$scope.$watch("conn.proto.value", function(value){
		if(!$scope.conn) return; 
		$scope.conn.$proto_editor = "<network-connection-proto-"+$scope.conn.proto.value+"-edit ng-model='conn'/>"; 
		$scope.conn.$proto_editor_ph = "<network-connection-proto-"+$scope.conn.proto.value+"-physical-edit ng-model='conn' protos='allInterfaceTypes' />"; 
		$scope.conn.$proto_editor_ad = "<network-connection-proto-"+$scope.conn.proto.value+"-advanced-edit ng-model='conn' />"; 
	}); 
	$scope.$watch("conn.type.value", function(value){
		if(!$scope.conn) return; 
		$scope.conn.$type_editor = "<network-connection-type-"+($scope.conn.type.value||'none')+"-edit ng-model='conn'/>"; 
	}); 
	$scope.$watch("conn", function(iface){
		if(!iface) return; 
		//iface.$type_editor = "<network-connection-type-"+(iface.type.value||'none')+"-edit ng-model='conn'/>"; 
		//iface.$proto_editor = "<network-connection-proto-"+iface.proto.value+"-edit ng-model='conn'/>"; 
		$rpc.network.interface.dump().done(function(ifaces){
			var info = ifaces.interface.find(function(x){ return x.interface == iface[".name"]; }); 
			iface.$info = info; 
			//$scope.$apply(); was causing digest in progress error TODO: figure out what the real problem is 
		}); 
	}); 
}); 

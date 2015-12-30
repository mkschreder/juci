//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkConnectionEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-edit.html", 
		scope: {
			interface: "=ngModel"
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
	 	if(!$scope.interface) return false;
	 	return $scope.allProtocolTypes.find(function(x){ if(x.value == $scope.interface.proto.value) return x.physical;}) != undefined;
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
	$rpc.juci.network.protocols().done(function(data){
		$scope.protocolTypes = $scope.allProtocolTypes.filter(function(x){
			if(x.value == "static") return true;
			return data.protocols.find(function(p){ return p == x.value }) != undefined;
		});
	});

	$scope.ifstatus = function(){
		if(!$scope.interface || !$scope.interface.$info || $scope.interface.$info.pending == undefined || $scope.interface.$info.up == undefined) return $tr(gettext("ERROR"));
		return ($scope.interface.$info.pending) ? $tr(gettext("PENDING")) : (($scope.interface.$info.up) ? $tr(gettext("UP")) : $tr(gettext("DOWN")));
	};
	$scope.onChangeProtocol = function(value, oldvalue){
		//TODO change confirm to juciDialog
		if(value == oldvalue) return;
		if(confirm($tr(gettext("Are you sure you want to switch? Your settings will be lost!")))){
			setProto(value);
			return true;
		}
		return false;
	};

	function setProto(proto){
		$scope.interface.$proto_editor = "<network-connection-proto-"+proto+"-edit ng-model='interface'/>"; 
		$scope.interface.$proto_editor_ph = "<network-connection-proto-"+proto+"-physical-edit ng-model='interface' protos='allInterfaceTypes' />"; 
		$scope.interface.$proto_editor_ad = "<network-connection-proto-"+proto+"-advanced-edit ng-model='interface' />"; 
	};	
	$scope.$watch("interface.type.value", function(value){
		if(!$scope.interface) return; 
		$scope.interface.$type_editor = "<network-connection-type-"+($scope.interface.type.value||'none')+"-edit ng-model='interface'/>"; 
	}); 
	$scope.$watch("interface", function(){
		if(!$scope.interface) return; 
		setProto($scope.interface.proto.value);
		$scope.interface.$type_editor = "<network-connection-type-"+($scope.interface.type.value||'none')+"-edit ng-model='interface'/>"; 
		$rpc.network.interface.dump().done(function(ifaces){
			var info = ifaces.interface.find(function(x){ return x.interface == $scope.interface[".name"]; }); 
			$scope.interface.$info = info; 
			$scope.$apply();// was causing digest in progress error TODO: figure out what the real problem is 
		}); 
	}); 
}); 

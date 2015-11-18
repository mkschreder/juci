//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
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
.controller("networkConnectionEdit", function($scope, $uci, $network, $rpc, $log, $tr, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.allInterfaceTypes = [
		{ label: $tr(gettext("Standard")), value: "" }, 
		{ label: $tr(gettext("AnyWAN")), value: "anywan" }, 
		{ label: $tr(gettext("Bridge")), value: "bridge" }
	]; 
	
	$scope.protocolTypes = [
		{ label: $tr(gettext("Static Address")), value: "static" }, 
		{ label: $tr(gettext("DHCP v4")), value: "dhcp" }, 
		{ label: $tr(gettext("DHCP v6")), value: "dhcpv6" }, 
		{ label: $tr(gettext("PPP")), value: "ppp" }, 
		{ label: $tr(gettext("PPP over Ethernet")), value: "pppoe" }, 
		{ label: $tr(gettext("PPP over ATM")), value: "pppoa" }, 
		{ label: $tr(gettext("3G (ppp over GPRS/EvDO/CDMA or UTMS)")), value: "3g" }, 
		{ label: $tr(gettext("QMI (USB modem)")), value: "qmi" }, 
		{ label: $tr(gettext("NCM (USB modem)")), value: "ncm" }, 
		{ label: $tr(gettext("HNET (self-managing home network)")), value: "hnet" }, 
		{ label: $tr(gettext("Point-to-Point Tunnel")), value: "pptp" }, 
		{ label: $tr(gettext("IPv6 tunnel in IPv4")), value: "6in4" }, 
		{ label: $tr(gettext("Automatic IPv6 Connectivity Client")), value: "aiccu" }, 
		{ label: $tr(gettext("IPv6 rapid deployment")), value: "6rd" }, 
		{ label: $tr(gettext("Dual-Stack Lite")), value: "dslite" }, 
		{ label: $tr(gettext("PPP over L2TP")), value: "l2tp" }, 
		{ label: $tr(gettext("Relayd Pseudo Bridge")), value: "relay" }, 
		{ label: $tr(gettext("GRE Tunnel over IPv4")), value: "gre" }, 
		{ label: $tr(gettext("Ethernet GRE over IPv4")), value: "gretap" }, 
		{ label: $tr(gettext("GRE Tunnel over IPv6")), value: "grev6" }, 
		{ label: $tr(gettext("Ethernet GRE over IPv6")), value: "grev6tap" },
	]; 
	
	$scope.$watch("conn.proto.value", function(value){
		if(!$scope.conn) return; 
		$scope.conn.$proto_editor = "<network-connection-proto-"+$scope.conn.proto.value+"-edit ng-model='conn'/>"; 
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

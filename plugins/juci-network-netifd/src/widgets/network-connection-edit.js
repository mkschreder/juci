//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/network-connection-edit.html", 
		scope: {
			conn: "=ngModel"
		}, 
		controller: "networkConnectionEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	$scope.expanded = true; 
	$scope.existingHost = { }; 
	
	$scope.protocolTypes = [
		{ label: "Static Address", value: "static" }, 
		{ label: "DHCP v4", value: "dhcp" }, 
		{ label: "DHCP v6", value: "dhcpv6" }, 
		{ label: "PPP", value: "ppp" }, 
		{ label: "PPP over Ethernet", value: "pppoe" }, 
		{ label: "PPP over ATM", value: "pppoa" }, 
		{ label: "3G (ppp over GPRS/EvDO/CDMA or UTMS)", value: "3g" }, 
		{ label: "QMI (USB modem)", value: "qmi" }, 
		{ label: "NCM (USB modem)", value: "ncm" }, 
		{ label: "HNET (self-managing home network)", value: "hnet" }, 
		{ label: "Point-to-Point Tunnel", value: "pptp" }, 
		{ label: "IPv6 tunnel in IPv4", value: "6in4" }, 
		{ label: "Automatic IPv6 Connectivity Client", value: "aiccu" }, 
		{ label: "IPv6 rapid deployment", value: "6rd" }, 
		{ label: "Dual-Stack Lite", value: "dslite" }, 
		{ label: "PPP over L2TP", value: "l2tp" }, 
		{ label: "Relayd Pseudo Bridge", value: "relay" }, 
		{ label: "GRE Tunnel over IPv4", value: "gre" }, 
		{ label: "Ethernet GRE over IPv4", value: "gretap" }, 
		{ label: "GRE Tunnel over IPv6", value: "grev6" }, 
		{ label: "Ethernet GRE over IPv6", value: "grev6tap" },
	]; 
	
	$scope.$watch("conn.proto.value", function(value){
		if(!$scope.conn) return; 
		$scope.conn.$proto_editor = "<network-connection-proto-"+$scope.conn.proto.value+"-edit ng-model='conn'/>"; 
	}); 
	
	$scope.$watch("conn", function(iface){
		if(!iface) return; 
		iface.$type_editor = "<network-connection-type-"+iface.type.value+"-edit ng-model='conn'/>"; 
		iface.$proto_editor = "<network-connection-proto-"+iface.proto.value+"-edit ng-model='conn'/>"; 
		$rpc.network.interface.dump().done(function(ifaces){
			var info = ifaces.interface.find(function(x){ return x.interface == iface[".name"]; }); 
			iface.$info = info; 
			$scope.$apply(); 
		}); 
	}); 
}); 

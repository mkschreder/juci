//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("simpleWANConfigPage", function($scope, $uci, $tr, gettext){
	$scope.wan = {}; 

	$uci.$sync("network").done(function(){
		$scope.wan = $uci.network.wan; 
		$scope.$apply(); 
	}); 
		
	$scope.protocolTypes = [
		{ label: $tr(gettext("Static Address")), value: "static" }, 
		{ label: $tr(gettext("DHCP v4")), value: "dhcp" }, 
		{ label: $tr(gettext("DHCP v6")), value: "dhcpv6" }, 
		{ label: $tr(gettext("PPP over Ethernet")), value: "pppoe" } 
	]; 
	
	$scope.$watch("wan.proto.value", function(value){
		if(!$scope.wan.proto) return; 
		$scope.editor = "<network-connection-proto-"+$scope.wan.proto.value+"-edit ng-model='wan'/>"; 
	}); 

}); 

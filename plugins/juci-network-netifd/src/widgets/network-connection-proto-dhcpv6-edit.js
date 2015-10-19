//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoDhcpv6Edit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-dhcpv6-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoDhcpv6Edit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoDhcpv6Edit", function($scope, $uci, $network, $rpc, $log, $tr, gettext){
	$scope.allReqAddrTypes = [
		{ label: $tr(gettext("Try")), value: "try" }, 
		{ label: $tr(gettext("Force")), value: "try" }, 
		{ label: $tr(gettext("None")), value: "try" }
	]; 
	$scope.allPrefixReqTypes = [
		{ label: "48", value: "48" }, 
		{ label: "52", value: "52" }, 
		{ label: "56", value: "56" }, 
		{ label: "60", value: "60" }, 
		{ label: "64", value: "64" }, 
		{ label: $tr(gettext("Auto")), value: "auto" }, 
		{ label: $tr(gettext("Disabled")), value: "no" }
	]; 
}); 

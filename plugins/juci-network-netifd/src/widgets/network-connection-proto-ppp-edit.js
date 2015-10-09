//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoPppEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-ppp-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoPppEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	
}); 

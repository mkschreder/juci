//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoPppoeEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-ppp-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppoeEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoPppoeEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	
}); 

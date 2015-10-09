//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("networkConnectionProtoPppoaEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-connection-proto-pppoa-edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "networkConnectionProtoPppoaEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("networkConnectionProtoPppoaEdit", function($scope, $uci, $network, $rpc, $log, gettext){
	
}); 

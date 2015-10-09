//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProtoQmiEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-Qmi-edit.html", 
		controller: "networkConnectionProtoQmiEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProtoQmiEdit", function($scope, $network, $modal, $tr, gettext){
	
}); 

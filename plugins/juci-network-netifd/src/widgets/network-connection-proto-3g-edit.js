//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProto3gEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-3g-edit.html", 
		controller: "networkConnectionProto3gEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProto3gEdit", function($scope, $network, $modal, $tr, gettext){
	
}); 

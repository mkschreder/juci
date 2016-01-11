//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProto4gEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-4g-edit.html", 
		controller: "networkConnectionProto4gEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProto4gEdit", function($scope, $network, $modal, $tr, gettext){
	
}); 

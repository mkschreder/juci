//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProtoNcmEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-Ncm-edit.html", 
		controller: "networkConnectionProtoNcmEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProtoNcmEdit", function($scope, $network, $modal, $tr, gettext){
	
}); 

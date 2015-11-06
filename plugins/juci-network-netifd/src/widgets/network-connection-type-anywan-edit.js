//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionTypeAnywanEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-anywan-edit.html", 
		controller: "networkConnectionTypeAnywanEdit", 
		replace: true
	 };  
})
.controller("networkConnectionTypeAnywanEdit", function($scope, $network, $modal){
	// expose tab title 
	gettext("network.interface.type.anywan.tab.title"); 
}); 

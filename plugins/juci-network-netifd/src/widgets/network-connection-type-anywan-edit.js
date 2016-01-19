//!Author: Reidar Cederqvist <reidar.cederqvist@gmail.com> 

JUCI.app
.directive("networkConnectionTypeAnywanEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-anywan-edit.html", 
		replace: true
	 };  
});

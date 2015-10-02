//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkClientLanDisplayWidget", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-client-lan-display-widget.html", 
		controller: "networkClientLanDisplayWidget", 
		scope: {
			client: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("networkClientLanDisplayWidget", function($scope){	

}); 

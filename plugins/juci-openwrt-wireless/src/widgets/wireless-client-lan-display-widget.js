//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("wirelessClientLanDisplayWidget", function($compile, $parse){
	return {
		templateUrl: "/widgets/wireless-client-lan-display-widget.html", 
		controller: "wirelessClientLanDisplayWidget", 
		scope: {
			client: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("wirelessClientLanDisplayWidget", function($scope){	

}); 

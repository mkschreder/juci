//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkConnectionProtoBridgeEdit", function($compile){
	return {
		scope: {
			connection: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-bridge-edit.html", 
		controller: "networkConnectionProtoBridgeEdit", 
		replace: true
	 };  
})
.controller("networkConnectionProtoBridgeEdit", function($scope){
	$scope.$watch("connection", function(value){
		if(!value) return; 
		//console.log("devs: "+value.addedDevices); 
	}); 
}); 

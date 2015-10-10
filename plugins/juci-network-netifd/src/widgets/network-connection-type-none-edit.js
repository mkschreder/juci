//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

gettext("network.interface.type.none.tab.title"); 

JUCI.app
.directive("networkConnectionTypeNoneEdit", function($compile){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-type-none-edit.html", 
		controller: "networkConnectionTypeNoneEdit", 
		replace: true
	 };  
})
.controller("networkConnectionTypeNoneEdit", function($scope, $ethernet, $modal, $tr, gettext){
	$ethernet.getAdapters().done(function(devs){
		$scope.baseDevices = devs.filter(function(dev){ return !dev.loopback }).map(function(dev){
			return { label: dev.device + " ("+dev.name+")", value: dev.device }; 
		});
		$scope.$apply();  
	}); 
}); 

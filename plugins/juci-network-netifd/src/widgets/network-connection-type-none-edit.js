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
.controller("networkConnectionTypeNoneEdit", function($scope, $network, $modal, $tr, gettext){
	$network.getDevices().done(function(devs){
		$scope.baseDevices = devs.filter(function(dev){ return !dev.loopback && dev.up; }).map(function(dev){
			return { label: dev.name + " ("+dev.id+")", value: dev.id }; 
		});
		$scope.$apply();  
	}); 
}); 

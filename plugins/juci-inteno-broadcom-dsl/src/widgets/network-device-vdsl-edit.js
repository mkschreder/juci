//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceVdslEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-vdsl-edit.html", 
		controller: "networkDeviceVdslEdit", 
		replace: true
	};  
})
.controller("networkDeviceVdslEdit", function($scope, $broadcomDsl, gettext, $tr){
	$broadcomDsl.getDevices().done(function(devices){
		var baseDevices = devices.filter(function(x){ return x.type == "vdsl"; }).map(function(x){
			return {
				label: x.name, 
				value: x.id
			}
		}); 
		
		$scope.latencyPaths = [
			{ label: $tr(gettext("Latency Path 1")), value: "1" }, 
			{ label: $tr(gettext("Latency Path 2")), value: "2" }, 
			{ label: $tr(gettext("Latency Path 1 & 2")), value: "1,2" }
		]; 
		
		$scope.ptmPriorities = [
			{ label: $tr(gettext("Normal Priority")), value: "1" }, 
			{ label: $tr(gettext("High Priority")), value: "2" }
		]
		
		$scope.qosAlos = [
			{ label: $tr(gettext("Strict Priority Precedence")), value: "1" },
			{ label: $tr(gettext("Weighted Fair Queuing")), value: "2" }
		]; 
		
		$scope.baseDevices = baseDevices; 
		$scope.$apply(); 
		
		$scope.$watch("device", function onNetworkVDSLDeviceChanged(value){
			if(!value) return; 
			$scope.conf = value.base || value; 
		}); 
	}); 
}); 

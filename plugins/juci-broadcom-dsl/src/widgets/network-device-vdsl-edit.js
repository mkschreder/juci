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
.controller("networkDeviceVdslEdit", function($scope, $network){
	$network.getDevices().done(function(devices){
		var baseDevices = devices.filter(function(x){ return x.type == "vdsl_baseif"; }).map(function(x){
			return {
				label: x.name, 
				value: x.id
			}
		}); 
		
		$scope.latencyPaths = [
			{ label: "Latency Path 1", value: "1" }, 
			{ label: "Latency Path 2", value: "2" }, 
			{ label: "Latency Path 1 & 2", value: "1,2" }
		]; 
		
		$scope.ptmPriorities = [
			{ label: "Normal Priority", value: "1" }, 
			{ label: "High Priority", value: "2" }
		]
		
		$scope.qosAlos = [
			{ label: "Strict Priority Precedence", value: "1" },
			{ label: "Weighted Fair Queuing", value: "2" }
		]; 
		
		$scope.baseDevices = baseDevices; 
		$scope.$apply(); 
		
		$scope.$watch("device", function(value){
			if(!value) return; 
			$scope.conf = value.base || value; 
		}); 
	}); 
	
}); 

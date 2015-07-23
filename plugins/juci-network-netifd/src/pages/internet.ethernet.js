//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceEdit", function($compile){
	return {
		scope: {
			ngModel: "=ngModel"
		}, 
		link: function(scope, element, attrs){
			if(scope.ngModel && scope.ngModel.type){
				element.html($compile("<network-device-"+scope.ngModel.type+"-edit ng-model='ngModel'></network-device-"+scope.ngModel.type+"-edit>")(scope));
			} else {
				element.html("<p>Device of unknown type!</p>");
			}
		}, 
		template: "test"
	};
})
.controller("InternetLayer2", function($scope, $uci, $network, $config){
	$network.getDevices().done(function(devices){
		$scope.devices = devices;//.filter(function(x){ return x.type != "baseif"; }); 
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ return x.is_lan.value == true }); 
			$scope.$apply(); 
			//drawCyGraph(); 
		}); 
	}); 
}); 

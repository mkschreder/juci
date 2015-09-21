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
.controller("InternetLayer2", function($scope, $uci, $rpc, $ethernet, $network, $config){
	$scope.config = $config; 
	
	$ethernet.getAdapters().done(function(adapters){
		$scope.adapters = adapters.filter(function(a){
			return (!a.flags || !a.flags.match("NOARP")); 
		});  
	
		$scope.$apply(); 
	}); 
}); 

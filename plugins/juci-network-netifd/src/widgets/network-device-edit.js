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
		} 
	};
})


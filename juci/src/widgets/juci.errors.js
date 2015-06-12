//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciErrors", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
			ngModel: "="
		}, 
		templateUrl: plugin_root+"/widgets/juci.errors.html", 
		replace: true, 
		controller: "juciErrors"
	}; 
})
.controller("juciErrors", function($scope, $rootScope, $localStorage){
	if($scope.ngModel) $scope.errors = $scope.ngModel; 
	else $scope.errors = $rootScope.errors; 
}); 

JUCI.app
.directive("juciError", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
			value: "="
		}, 
		template: '<div ng-show="value" class="alert-danger" style="margin-top: 10px; font-size: 0.8em; padding: 5px; border-radius: 5px">{{value}}</div>', 
		replace: true
	}; 
}); 

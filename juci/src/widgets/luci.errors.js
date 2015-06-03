JUCI.app
.directive("luciErrors", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
			ngModel: "="
		}, 
		templateUrl: plugin_root+"/widgets/luci.errors.html", 
		replace: true, 
		controller: "luciErrors"
	}; 
})
.controller("luciErrors", function($scope, $rootScope, $localStorage){
	if($scope.ngModel) $scope.errors = $scope.ngModel; 
	else $scope.errors = $rootScope.errors; 
}); 

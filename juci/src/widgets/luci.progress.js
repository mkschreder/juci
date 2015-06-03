//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("luciProgress", function(){
	var plugin_root = $juci.module("core").plugin_root; 
	return {
		// accepted parameters for this tag
		scope: {
			value: "=", 
			total: "=", 
			units: "="
		}, 
		templateUrl: plugin_root+"/widgets/luci.progress.html", 
		replace: true, 
		controller: "LuciProgressControl",
		link: function(scope, element, attributes){
			// make sure we interpret the units as string
			scope.units = attributes.units; 
		}
	}; 
})
.controller("LuciProgressControl", function($scope, $navigation){
	function update(){
		if($scope.value && Number($scope.value) != 0)
			$scope.width = Math.round((Number($scope.value||0) / Number($scope.total||0)) * 100); 
		else
			$scope.width = 0; 
	}
	$scope.$watch("value", update);
	$scope.$watch("total", update); 
}); 

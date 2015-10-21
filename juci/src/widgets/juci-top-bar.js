//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciTopBar", function($compile){
	return {
		templateUrl: "/widgets/juci-top-bar.html", 
		controller: "juciTopBarController", 
		replace: true
	 };  
})
.controller("juciTopBarController", function($scope, $config){
	$scope.model = $config.hardware_model; 
}); 

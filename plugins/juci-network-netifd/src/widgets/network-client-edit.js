//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkClientEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/network-client-edit.html", 
		controller: "networkClientEdit", 
		scope: {
			opts: "=ngModel"
		},
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("networkClientEdit", function($scope, $ethernet, $location){	
	$scope.closeDialog = function(){
		if(!$scope.opts || !$scope.opts.modal) return; 
		$scope.opts.modal.dismiss("cancel"); 
	}
}); 


//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("ServiceSambaPage", function($scope, $rpc, gettext){
	$rpc.router.igmptable().done(function(result){
		if(!result.table) {
			$scope.$emit("error", gettext("Unable to retreive igmptable from device!")); 
			return; 
		} 
		$scope.igmptable = result.table; 
		$scope.$apply(); 
	}); 
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusProcessesPageCtrl", function($scope, $rpc, gettext){
	$rpc.juci.system.process.list().done(function(result){
		if(!result.list) {
			$scope.$emit("error", gettext("Unable to retreive igmptable from device!")); 
			return; 
		} 
		$scope.igmptable = result.igmptable; 
	}); 
}); 

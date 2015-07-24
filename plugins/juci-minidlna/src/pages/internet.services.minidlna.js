//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniDLNAConfigPage", function($scope, $minidlna){
	$minidlna.getConfig().done(function(config){
		$scope.config = config; 
		$scope.$apply(); 
	}); 
}); 

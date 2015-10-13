//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageUhttpdSettings", function($scope, $uci, $systemService, gettext){
	$uci.$sync("uhttpd").done(function(){
		$scope.config = $uci.uhttpd.main; 
		$scope.$apply(); 
	}); 
	$systemService.find("uhttpd").done(function(service){
		$scope.service = service; 
		$scope.$apply(); 
	}); 	
}); 

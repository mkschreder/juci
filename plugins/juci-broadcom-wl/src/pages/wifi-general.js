//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiGeneralPageCtrl", function($scope, $uci, $wireless){
	$uci.$sync("wireless").done(function(){
		$scope.status = $uci.wireless.status; 
		//$scope.router = $router; 
		$scope.$apply(); 
	}); 
}); 

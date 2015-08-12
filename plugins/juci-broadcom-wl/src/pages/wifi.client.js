//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiClientPage", function($scope, $uci, $wireless, gettext){
	$wireless.scan(); 
	setTimeout(function(){
		$wireless.getScanResults().done(function(result){
			$scope.access_points = result.access_points;
			$scope.$apply(); 
		});
	}, 5000); 
}); 

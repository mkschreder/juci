//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageBroadcomWifiClientConf", function($scope, $uci, $wireless, gettext){
	$wireless.scan(); 
	setTimeout(function(){
		$wireless.getScanResults().done(function(result){
			$scope.access_points = result.access_points;
			$scope.$apply(); 
		});
	}, 5000); 
}); 

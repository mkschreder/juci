//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("PageBroadcomWifiStatus", function($scope, $uci, $wireless, gettext){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = ($scope.predicate === pred) ? !$scope.reverse : false;
	}

	JUCI.interval.repeat("wifi-status", 8000, function(done){
		$wireless.scan(); 
		setTimeout(function(){
			$wireless.getScanResults().done(function(aps){
				$scope.access_points = aps;
				$scope.$apply(); 
				done(); 
			});
		}, 4000); 
	}); 
}); 

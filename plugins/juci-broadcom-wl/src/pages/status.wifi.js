//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiStatusPage", function($scope, $uci, $wireless, gettext){
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

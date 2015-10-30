//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("wirelessClientModePage", function($scope, $uci, $wireless, gettext){
	$wireless.scan(); 
	JUCI.interval.repeat("wifi-scan", 5000, function(done){
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

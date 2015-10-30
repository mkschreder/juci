//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("wirelessStatusPage", function($scope, $uci, $wireless, gettext){
	$scope.order = function(pred){
		$scope.predicate = pred; 
		$scope.reverse = ($scope.predicate === pred) ? !$scope.reverse : false;
	}
	$uci.$sync("wireless").done(function(){
		$scope.dfs_enabled = $uci.wireless["@wifi-device"].find(function(x){ return x.dfsc.value != 0; }) != null; 
		$scope.doScan = function(){
			$scope.scanning = 1; 
			async.eachSeries($uci.wireless["@wifi-device"].filter(function(x){ return x.dfsc.value != 0; }), function(dev, next){
				console.log("Scanning on "+dev[".name"]); 
				$wireless.scan({device: dev[".name"]}).done(function(){
					setTimeout(function(){
						console.log("Getting scan results for "+dev[".name"]); 
						$wireless.getScanResults({device: dev[".name"]}).done(function(aps){
							$scope.access_points = aps;
							$scope.scanning = 0; 
							$scope.$apply(); 
						}); 
					}, 4000); 
					next(); 
				}); 
			}); 
		} 
	}); 
}); 

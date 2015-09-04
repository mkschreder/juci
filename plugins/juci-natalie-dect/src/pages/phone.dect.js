//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.controller("PhoneDectPage", function($scope, $rpc, gettext){
	if($rpc.sys && $rpc.sys.dect){
		JUCI.interval.repeat("dect.refresh", 1000, function(done){
			$rpc.sys.dect.status().done(function(stats){
				$scope.status = stats; 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
		$scope.onStartPairing = function(){
			$rpc.sys.dect.pair().done(function(){
				
			}); 
		}
		$scope.onPingHandset = function(hs){
			$rpc.sys.dect.ping({ id: hs.id }).done(function(){
				
			}); 
		}
	}
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetMultiWANPage", function($scope, $uci, $rpc, $network, $config){
	$uci.sync("multiwan").done(function(){
		$scope.multiwan = $uci.multiwan; 
		$scope.$apply(); 
	}); 
}); 

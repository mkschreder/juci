//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("simpleDhcpConfigPage", function($scope, $uci){
	$uci.$sync("network").done(function(){
		$scope.lan = $uci.network.lan; 
		$scope.$apply(); 
	}); 
}); 

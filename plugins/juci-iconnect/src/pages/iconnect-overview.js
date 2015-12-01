//! Author: Martin K. Schröder
//! Copyright 2015

JUCI.app.controller("iconnectOverviewPage", function($scope, $rpc){
	JUCI.interval.repeat("iconnect-refresh", 2000, function(done){
		$rpc.iconnect.clients().done(function(result){
			$scope.clients = result.clients; 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
}); 

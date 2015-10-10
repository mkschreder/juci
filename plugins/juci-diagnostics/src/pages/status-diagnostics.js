//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusDiagnostics", function($scope, $rpc, $network){
	$scope.data = {}; 
	$network.getNetworks().done(function(nets){
		$scope.data.allInterfaces = nets.map(function(x){ return { label: x[".name"], value: x[".name"] }; }); 
		$scope.$apply(); 
	}); 
	$scope.onTraceTest = function(){
		$rpc.juci.diagnostics.traceroute({ host: $scope.data.traceHost }).done(function(result){
			if(result.stderr) $scope.data.traceError = result.stderr; 
			$scope.data.traceResults = result.stdout; 
			$scope.$apply(); 
		}).fail(function(error){
			$scope.data.traceResults = ""; 
			$scope.data.traceError = JSON.stringify(error); 
			$scope.$apply(); 
		}); 
	}
	$scope.onPingTest = function(){
		$scope.data.pingResults = "..."; 
		$scope.data.error = "";
		$rpc.juci.diagnostics.ping({ host: $scope.data.pingHost }).done(function(result){
			if(result.stderr) $scope.data.pingError = result.stderr; 
			$scope.data.pingResults = result.stdout; 
			$scope.$apply(); 
		}).fail(function(error){
			$scope.data.pingResults = ""; 
			$scope.data.pingError = JSON.stringify(error); 
			$scope.$apply(); 
		}); 
	}
}); 

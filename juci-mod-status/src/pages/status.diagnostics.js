//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusDiagnostics", function($scope, $rpc){
	$scope.data = {}; 
	$rpc.router.networks().done(function(result){
		if(result){
			$scope.data.allInterfaces = Object.keys(result).map(function(x){return {label: x, value: x};}); 
			$scope.$apply(); 
		}
	}); 
	$scope.onTraceTest = function(){
		$rpc.juci2.network.traceroute({ data: $scope.data.traceHost }).done(function(result){
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
		$rpc.juci2.network.ping({ data: $scope.data.pingHost }).done(function(result){
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

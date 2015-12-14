//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusSystemProcesses", function ($scope, $rpc, gettext, $tr) {
	JUCI.interval.repeat("juci-process-list", 5000, function(done){
		$rpc.juci.system.process.list().done(function(processes){
			$scope.processes = processes.list; 
			$scope.columns = processes.fields; 
			$scope.$apply(); 
			done(); 
		});
	}); 
	$scope.isopen = false;
	$scope.getCpuUsage = function(){
		if(!$scope.processes) return '0%'
		var sum = 0;
		$scope.processes.map(function(x){sum += Number(x["%CPU"].slice(0, -1));});
		return sum + '%'
	};
}); 

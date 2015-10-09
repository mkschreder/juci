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
}); 

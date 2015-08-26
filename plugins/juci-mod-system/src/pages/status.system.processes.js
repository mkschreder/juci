//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusSystemProcesses", function ($scope, $rpc, gettext, $tr) {
	$rpc.juci.system.process.list().done(function(processes){
		$scope.processes = processes.list; 
		$scope.columns = processes.fields; 
	}); 
}); 

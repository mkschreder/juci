//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.controller("EventLogConfigPage", function($scope, $uci, $systemService){ 
	$uci.$sync("system").done(function(){
		$scope.system = $uci.system; 
		$scope.$apply(); 
	}); 
}); 

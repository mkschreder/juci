//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("MiniSNMPDConfigPage", function($scope, $uci, gettext){
	$uci.$sync("snmpd").done(function(){
		if(!$uci.snmpd || !$uci.snmpd["@system"].length) return; 
		$scope.config = $uci.snmpd["@system"][0]; 
		$scope.$apply(); 
	}); 
}); 

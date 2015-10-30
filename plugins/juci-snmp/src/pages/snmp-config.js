//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SnmpConfigPage", function($scope, gettext){
	$uci.$sync("snmpd").done(function(){
		if(!$uci.snmpd || !$uci.snmpd["@mini_snmpd"].length) return; 
		$scope.config = $uci.snmpd["@mini_snmpd"]; 
		$scope.$apply(); 
	}); 
}); 

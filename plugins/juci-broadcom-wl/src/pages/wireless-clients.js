//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("wirelessClientsPage", function($scope, $uci, $wireless){
	$scope.lines = [
		{ title: "Hostname", field: "hostname" }, 
		{ title: "IPv4 Address", field: "ipaddr" }, 
		{ title: "Frequency", field: "band" },
		{ title: "MAC-Address", field: "macaddr" }, 
		{ title: "RSSI", field: "rssi" }, 
		{ title: "Noise", field: "noise" }
	]; 
	$wireless.getConnectedClients().done(function(clients){
		$scope.clients = clients; 
		$scope.$apply(); 
	}); 
}); 

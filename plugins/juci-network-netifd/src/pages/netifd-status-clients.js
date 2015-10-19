//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("NetifdStatusClientsPage", function($scope, $network){
	$network.getConnectedClients().done(function(clients){
		$scope.clients = clients; 
		$scope.$apply(); 
	}); 
}); 

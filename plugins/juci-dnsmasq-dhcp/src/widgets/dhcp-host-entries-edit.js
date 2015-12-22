//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.directive("dhcpHostEntriesEdit", function(){
	return {
		scope: {
			model: "=ngModel"
		},
		templateUrl: "/widgets/dhcp-host-entries-edit.html",
		controller: "dhcpHostEntriesEditCtrl",
		replace: true
	}
}).controller("dhcpHostEntriesEditCtrl", function($scope, $firewall){
	$firewall.getZoneClients("lan").done(function(clients){
		$scope.clients = clients.map(function(x){ 
			var name = x.ipaddr + ((x.hostname == "") ? "" : " (" + x.hostname + ")");
			return { label: name, value: x.ipaddr }
		});
		console.log($scope.clients);
	});
	$scope.$watch("model", function(){
		if(!$scope.model) return;
		console.log($scope.model);
	}, false);
});

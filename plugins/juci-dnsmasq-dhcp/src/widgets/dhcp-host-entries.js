//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app.directive("dhcpHostEntries", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-host-entries.html",
		controller: "dhcpHostEntriesCtrl",
		replace: true
	}
}).controller("dhcpHostEntriesCtrl", function($scope, $uci){
	$uci.$sync("dhcp").done(function(){
		$scope.hosts = $uci.dhcp["@domain"];
		console.log($scope.hosts);
		$scope.$apply();
	});
	$scope.getItemTitle = function(item){
		return item[".name"];
	}
});

/*
*/

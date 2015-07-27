//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallZonesPage", function($scope, $firewall){
	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		$scope.$apply(); 
	}); 
	$scope.getItemTitle = function(item){
		return item.name.value; 
	}
}); 

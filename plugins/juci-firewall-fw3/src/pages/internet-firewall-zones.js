//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallZonesPage", function($scope, $firewall, $uci){

	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		$scope.$apply(); 
	}); 
	
	$scope.getItemTitle = function(item){
		return item.name.value; 
	}
	
	
	$scope.onCreateZone = function(){
		$uci.firewall.create({
			".type": "zone", 
			"name": "new_zone"
		}).done(function(zone){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onDeleteZone = function(zone){
		if(!zone) alert(gettext("Please select a zone to delete!")); 
		if(confirm(gettext("Are you sure you want to delete this zone?"))){
			zone.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("NetifdVlanConfigPage", function($scope, $uci){
	$uci.$sync("network").done(function(){
		$scope.vlans = $uci.network["@switch_vlan"]; 
		$scope.$apply(); 
	}); 
	
	$scope.onAddVlan = function(){
		$uci.network.create({
			".type": "switch_vlan",
			".name": "new vlan"
		}).done(function(interface){
			$scope.$apply(); 
		}); 
	}
	
}); 

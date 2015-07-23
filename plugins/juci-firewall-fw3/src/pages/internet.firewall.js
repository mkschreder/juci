//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallPageCtrl", function($scope, $uci, $firewall, $config){
	$scope.firewallSwitchState = 0; 
	$firewall.getZones().done(function(zones){
		$scope.zones = zones; 
		$scope.$apply(); 
	}); 
	$firewall.getRules().done(function(rules){
		$scope.rules = rules; 
		$scope.$apply(); 
	}); 
	$uci.sync("firewall").done(function(){
		$scope.firewall = $uci.firewall; 
		$scope.firewallSwitchState = $uci.firewall["@zone"].filter(function(zone){ 
			return zone.name.value == "wan" && zone.input.value == "REJECT" && zone.forward.value == "REJECT"; 
		}).length > 0; 
		$scope.$apply(); 
	}); 
	
	$scope.onFirewallToggle = function(){
		if($scope.firewallSwitchState) {
			$uci.firewall["@zone"].map(function(zone){
				if(zone.name.value == "wan"){
					zone.input.value = "REJECT"; 
					zone.forward.value = "REJECT"; 
				}
			}); 
		} else {
			$uci.firewall["@zone"].map(function(zone){
				if(zone.name.value == "wan"){
					zone.input.value = "ACCEPT"; 
					zone.forward.value = "ACCEPT"; 
				}
			}); 
		}
	}
	
	// just to update the rules based on switch value
	$scope.onFirewallToggle(); 
}); 

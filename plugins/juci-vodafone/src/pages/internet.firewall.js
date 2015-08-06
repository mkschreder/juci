//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
$juci.module("internet")
.controller("InternetFirewallPageCtrl", function($scope, $uci, $config){
	$scope.firewallSwitchState = 0; 
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

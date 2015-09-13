//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("uciFirewallNatRuleEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.firewall.nat.rule.edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "uciFirewallNatRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallNatRuleEdit", function($scope, $uci, $rpc, $firewall, $network, $log){
	$scope.portIsRange = 0;
	$scope.data = {}; 
	$scope.$watch("ngModel", function(value){
		if(!value) return;
		$scope.data.src_ip_enabled = (value.src_ip.value)?true:false; 
		var ngModel = value; 
		if(ngModel && ngModel.src_dport && ngModel.dest_port && ngModel.src_dport.value && ngModel.dest_port.value){	
			$scope.portIsRange = (ngModel.src_dport.value.indexOf("-") != -1) || (ngModel.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"}, 
		{ label: "TCP", value: "tcp"}, 
		{ label: "TCP + UDP", value: "tcpudp" }
	]; 
	$scope.deviceChoices = [];
	$firewall.getZones().done(function(zones){
		$scope.allZones = zones.map(function(x){ return { label: x.name.value.toUpperCase(), value: x.name.value } }); 
		$network.getConnectedClients().done(function(clients){
			var choices = []; 
			clients.map(function(c) {
				choices.push({
					label: (c.hostname && c.hostname.length)?c.hostname:c.ipaddr, 
					value: c.ipaddr
				}); 
			}); 
			$scope.deviceChoices = choices; 
			$scope.$apply(); 
		});
	}); 
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("uciFirewallRuleEdit", function($compile, $parse){
	return {
		templateUrl: plugin_root+"/widgets/uci.firewall.rule.edit.html", 
		scope: {
			ngModel: "=ngModel"
		}, 
		controller: "uciFirewallRuleEdit", 
		replace: true
	 };  
}).controller("uciFirewallRuleEdit", function($scope, $uci, $rpc, $network, $log){
	$scope.$watch("ngModel", function(value){
		if(!value) return; 
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
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 

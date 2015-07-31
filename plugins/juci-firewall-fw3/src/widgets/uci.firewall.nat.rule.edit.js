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
}).controller("uciFirewallNatRuleEdit", function($scope, $uci, $rpc, $log){
	$scope.portIsRange = 0;
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
	$rpc.router.clients().done(function(clients){
		var choices = []; 
		Object.keys(clients).map(function(x) {
			var c = clients[x]; 
			if(c.connected){
				choices.push({
					label: (c.hostname && c.hostname.length)?c.hostname:c.ipaddr, 
					value: c.ipaddr
				}); 
			} 
		}); 
		$scope.deviceChoices = choices; 
		$scope.$apply(); 
	});
	$scope.onPortRangeClick = function(value){
		$scope.portIsRange = value;  
	}
}); 

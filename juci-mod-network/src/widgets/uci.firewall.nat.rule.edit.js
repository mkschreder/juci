$juci.app.directive("uciFirewallNatRuleEdit", function($compile, $parse){
	var plugin_root = $juci.module("internet").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.firewall.nat.rule.edit.html", 
		scope: {
			rule: "=ngModel"
		}, 
		controller: "uciFirewallNatRuleEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("uciFirewallNatRuleEdit", function($scope, $uci, $rpc, $log){
	$scope.portIsRange = 0;
	$scope.$watch("rule", function(rule){
		if(rule && rule.src_dport && rule.dest_port && rule.src_dport.value && rule.dest_port.value){
			$scope.portIsRange = (rule.src_dport.value.indexOf("-") != -1) || (rule.dest_port.value.indexOf("-") != -1); 
		}
	}); 
	$scope.protocolChoices = [
		{ label: "UDP", value: "udp"}, 
		{ label: "TCP", value: "tcp"}, 
		{ label: "TCP + UDP", value: "tcpudp" }
	]; 
	$scope.patterns = {
		ipaddress: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
		port: /^\d{1,5}$/
	};
	$scope.deviceChoices = [{label: "test", value: "id"}];
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

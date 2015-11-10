//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("multiwanInterfaceEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/multiwan.interface.edit.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "multiwanInterfaceEdit", 
		replace: true, 
		require: "^ngModel"
	 };  
})
.controller("multiwanInterfaceEdit", function($scope, $uci, $network, $rpc, $tr, gettext){
	$scope.icmp = {hosts:'custom'};
	$scope.custom = {dns:"custom"};
	$scope.input_focus = false;
	$scope.LBD = [
		{ label: 'disable', value: 'disable' },
		{ label: '1', 		value: '1' },
		{ label: '2',		value: '2' },
		{ label: '3', 		value: '3' },
		{ label: '4',		value: '4' },
		{ label: '5',		value: '5' },
		{ label: '6',		value: '6' },
		{ label: '7',		value: '7' },
		{ label: '8',		value: '8' },
		{ label: '9',		value: '9' },
		{ label: '10',		value: '10' }
	];
	$scope.HMI = [
		{ label: 'Disable',	value: 'disable' },
		{ label: '5 sec', 	value: '5' },
		{ label: '10 sec', 	value: '10' },
		{ label: '20 sec', 	value: '20' },
		{ label: '30 sec', 	value: '30' },
		{ label: '60 sec', 	value: '60' },
		{ label: '120 sec',	value: '12' }
	];
	$scope.ICMPH = [
		{ label: 'Disable',			value: 'disable' },
		{ label: 'DNS server',		value: 'dns' },
		{ label: 'Default gateway',	value: 'gateway' },
		{ label: 'Custom',			value: 'custom' }
	];
	$scope.timeout = [
		{ label: 'Disable',	value: 'disable' },
		{ label: '1 sek',	value: '1' },
		{ label: '2 sek',	value: '2' },
		{ label: '3 sek',	value: '3' },
		{ label: '4 sek',	value: '4' },
		{ label: '5 sek',	value: '5' },
		{ label: '10 sek',	value: '10' }
	];
	$scope.health_method = [{label: 'Ping', value: 'ping'}, {label: 'Statistics', value: 'stats'}];
	$scope.HFR = [
		{ label: '1',	value: '1'},
		{ label: '3',	value: '3'},
		{ label: '5',	value: '5'},
		{ label: '10',	value: '10'},
		{ label: '15',	value: '15'},
		{ label: '20',	value: '20'}
	];
	$scope.dns = [{label: 'auto', value: 'auto'},{label: 'Custom', value: 'custom'}];
	$scope.failover_to = [];
	$scope.$watch('interface', function(){
		if(!$scope.interface) return;
		if($scope.dns.filter(function(x){return x.value == $scope.interface.dns.value}).length == 0){
			$scope.dns.unshift({label:$scope.interface.dns.value, value:$scope.interface.dns.value});
		}
		if($scope.ICMPH.filter(function(x){return x.value == $scope.interface.icmp_hosts.value}).length == 0){
			$scope.ICMPH.unshift({label:$scope.interface.icmp_hosts.value, value:$scope.interface.icmp_hosts.value});
		}
		console.log($scope.dns);
		$scope.failover_to = [
			{ label: 'disable',						value:'disable' },
			{ label: 'Load Balancer(Performance)',	value:'fastbalancer' },
			{ label: 'Load Balancer(Compability)',	value:'balancer' }
		];
		$uci.$sync("multiwan").done(function(){
			$scope.failover_to = $scope.failover_to.concat($uci.multiwan["@interface"].map(function(x){
				return { label: x[".name"], value: x[".name"] }; 
			}).filter(function(x){return x.value != $scope.interface[".name"]}));
			$scope.$apply(); 
		});
	});
	$scope.update_icmp = function(){
		if($scope.icmp.hosts == 'custom'){ 
			$scope.interface.icmp_hosts.value =	$scope.interface.icmp_hosts.ovalue;
		}else {
			if($scope.ICMPH.indexOf($scope.icmp.hosts) == -1){
				$scope.ICMPH.unshift({label:$scope.icmp.hosts, value:$scope.icmp.hosts});
			}
			$scope.interface.icmp_hosts.value = $scope.icmp.hosts; 
			$scope.interface.icmp_hosts.ovalue = $scope.icmp.hosts;
			$scope.icmp.hosts = "custom";
		}
	};
	$scope.update_dns = function(){
		if($scope.custom.dns == 'custom'){ 
			$scope.interface.dns.value =	$scope.interface.dns.ovalue;
		}else {
			if($scope.dns.indexOf($scope.icmp.hosts) == -1){
				$scope.dns.unshift({label:$scope.custom.dns, value:$scope.custom.dns});
			}
			$scope.interface.dns.value = $scope.custom.dns; 
			$scope.interface.dns.ovalue = $scope.custom.dns;
			$scope.custom.dns = "custom";
		}
	
	};
});

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
	$scope.icmp = {
		hosts:'custom'
	};
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
		{ label: 'disable',	value: 'disable' },
		{ label: '5 sec', 	value: '5' },
		{ label: '10 sec', 	value: '10' },
		{ label: '20 sec', 	value: '20' },
		{ label: '30 sec', 	value: '30' },
		{ label: '60 sec', 	value: '60' },
		{ label: '120 sec',	value: '12' }
	];
	$scope.ICMPH = [
		{ label: 'disable',			value: 'disable' },
		{ label: 'DNS server',		value: 'dns' },
		{ label: 'Default gateway',	value: 'gateway' },
		{ label: 'custom',			value: 'custom' }
	];
	$scope.update_icmp = function(){
		console.log("test: " + $scope.icmp.hosts);
		if($scope.icmp.hosts == 'custom'){ 
			$scope.interface.icmp_hosts.value =	$scope.interface.icmp_hosts.ovalue;
		}else {
			console.log($scope.ICMPH.indexOf($scope.icmp.hosts));
			if($scope.ICMPH.indexOf($scope.icmp.hosts) == -1){
				$scope.ICMPH.unshift({label:$scope.icmp.hosts, value:$scope.icmp.hosts});
			}
			$scope.interface.icmp_hosts.value = $scope.icmp.hosts; 
			$scope.interface.icmp_hosts.ovalue = $scope.icmp.hosts;
			$scope.icmp.hosts = "custom";
		}
	};
});

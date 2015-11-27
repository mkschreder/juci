//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("qosSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/qos-settings-edit.html",
		scope: {
			rule: "=ngModel"
		},
		controller: "qosSettingsEdit",
		replace: true,
		require: "^ngModel"
	};
})
.controller("qosSettingsEdit", function($scope, $uci, $tr, gettext, $network){
	$scope.data = {
		srchost: "",
		dsthost: "",
		proto: ""
	}
	$scope.update_data = function(value, obj){
		console.log(obj);
		if($scope.data[obj] == undefined) {
			return;
		}
		$scope.data[obj] = value;
	};
	$network.getConnectedClients().done(function(data){
		$scope.clients = data.map(function(x){
			return {label: x.ipaddr, value: x.ipaddr }
		});
		$scope.clients.push({label:$tr(gettext("all")), value: '' });
		$scope.clients.push({label:$tr(gettext("custom")), value: "custom" });
		$scope.$apply();
	});
	$uci.$sync(["qos"]).done(function(){
		$scope.targets = $uci.qos.Default.classes.value.split(" ").map(function(x){
			if(x == "Bulk") return { label: $tr(gettext("Low")), value: x };
			return { label: x, value: x };
		});
		$scope.$apply();
	});
	$scope.$watch("rule", function(){
		if(!$scope.rule) return;
		$scope.ports = $scope.rule.ports.value.split(",").map(function(port){return {value: port }});
	}, false);
	$scope.precedence = [
		{ label: $tr(gettext("all")),	value: '' },
		{ label: '0',					value: '0' },
		{ label: '1',					value: '8 10 12 14' },
		{ label: '2',					value: '16 18 20 22' },
		{ label: '3',					value: '24 26 28 30' },
		{ label: '4',					value: '32 34 36 38' },
		{ label: '5',					value: '40 46' },
		{ label: '6',					value: '48' },
		{ label: '7',					value: '56' }
	];
	$scope.protocols = [
		{ label: $tr(gettext("All")),		value: '' },
		{ label: $tr(gettext("TCP")),		value: 'tcp' },
		{ label: $tr(gettext("UDP")),		value: 'udp' },
		{ label: $tr(gettext("ICMP")),		value: 'icmp' },
		{ label: $tr(gettext("custom")),	value: 'custom' },
	];
	$scope.set_new_value = function(option){
		if(!$scope.rule[option] || !$scope.data[option]) return;
		if(!$scope.rule[option].valid || contains($scope.rule[option].value)){
			$scope.rule[option].value = $scope.rule[option].ovalue;
			$scope.data[option] = $scope.rule[option].value;
			return;
		}
		if(option == 'proto') $scope.protocols.unshift({ label:$scope.rule[option].value, value: $scope.rule[option].value });
		else $scope.clients.unshift({ label: $scope.rule[option].value, value: $scope.rule[option].value });
		$scope.data[option] = $scope.rule[option].value;
	};
	var contains = function(value){
		var c = false;
		$scope.clients.forEach(function(item){
			if(item.value == value) c = true;
		});
		return c;
	};
});

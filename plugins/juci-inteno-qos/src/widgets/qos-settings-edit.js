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
		new_srchost: "",
		new_dsthost: ""
	}
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
	});
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
	$scope.set_dsthost = function(){
		if($scope.data.new_dsthost == "custom"){
			$scope.rule.dsthost.value = $scope.rule.dsthost.ovalue;
			return;
		}
		$scope.clients.push({ label: $scope.data.new_dsthost, value: $scope.data.new_dsthost });
		$scope.rule.dsthost.value = $scope.data.new_dsthost;
		$scope.data.new_dsthost = "";
	};
	$scope.set_srchost = function(){
		if($scope.data.new_srchost == "" || $scope.clients[$scope.data.new_srchost]){
			$scope.rule.srchost.value = $scope.rule.srchost.ovalue;
			return;
		}
		$scope.clients.push({ label: $scope.data.new_srchost, value: $scope.data.new_srchost });
		$scope.rule.srchost.value = $scope.data.new_srchost;
		$scope.data.new_srchost = "";
	};
});

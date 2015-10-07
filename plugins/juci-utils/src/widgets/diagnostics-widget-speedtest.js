//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>
JUCI.app
.directive("diagnosticsWidget90Speedtest", function($compile, $parse){
	return {
		templateUrl: "/widgets/diagnostics-widget-speedtest.html",
		controller: "diagnosticsWidget90Speedtest", 
	 };  
})
.controller("diagnosticsWidget90Speedtest", function($scope, $rpc, $events, $uci, utilsAddTestserverPicker){
	$scope.data = {
		packagesize: 50000,
		test_type: "up_down",
		result: "",
		state: ""
	}; 
	$scope.min = 10000; 
	$scope.max = 100000; 
	$scope.$watch('data.packagesize', function(new_value){
		if(new_value < $scope.min)$scope.data.packagesize = $scope.min;
		if(new_value > $scope.max)$scope.data.packagesize = $scope.max;
		console.log("new_value = " + new_value);
	});
	function getServers(){
		$scope.allTestServers = $scope.testServers.map(function(x){
			return {
				label: x.server.value + "/" + x.port.value, 
				value: x
			}
		});
	}
	$scope.testType = [
		{value:"up_down", label: "up and down"}, 
		{value:"up", label: "up"}, 
		{value:"down", label:"down"} ];
	$uci.$sync("speedtest").done(function(){
		$scope.testServers = $uci.speedtest["@testserver"];
		getServers();
		if($scope.testServers.length)
			$scope.data.server = $scope.testServers[0]; 
		$scope.$apply();
	});
	$scope.runTest = function(){
		if(!$scope.testServers.length){
			window.alert("Server and port is mandatory");
			return;
		}
		if($scope.data.state == "running"){
			window.alert("Only one test can be run at a time");
			return;
		}
		$rpc.juci.utils.speedtest.run({
			"testmode": $scope.data.test_type,
			"port": $scope.data.server.port.value,
			"packagesize": $scope.data.packagesize,
			"address": $scope.data.server.server.value
		}).done(function(response){
			if(response && response.message=="success"){
				console.log("success running tptest");
				$scope.data.state="running";
			}else{
				console.log("error running tptest");
				$scope.data.state="";
			}
			$scope.$apply();
		});
	}
	$scope.onRemoveAddress = function(){
		$scope.data.server.$delete().done(function(){
			$uci.$save().done(function(){
				getServers();
				if($scope.testServers.length)
					$scope.data.server = $scope.testServers[0]; 
				$scope.$apply();
			});
		});
	}
	$scope.onAddAddress = function(){
		utilsAddTestserverPicker.show().done(function(data){
			if(!data)return;
			$uci.speedtest.create({
				".type": "testserver",
				"server": data.address,
				"port": data.port
			}).done(function(){
				$uci.$save().done(function(){
					getServers();
					if($scope.testServers.length==1)
						$scope.data.server = $scope.testServers[0];
					$scope.$apply();
				});
			});
			console.log("address = " + data.address + "port = " + data.port);
		});
	}
	$events.subscribe("juci.utils.speedtest", function(res){
		console.log(res);
		switch(res.data.status) {
		case 0:
			$scope.data.result="Upstream: " + res.data.upstream + "\nDownstream: " + res.data.downstream;
			$scope.data.state="result";
			break;
		case -1:
			$scope.data.result="Wrong TP-test address and/or port";
			$scope.data.state="error";
			break;
		case -2:
			$scope.data.result="Wrong TP-test port but correct address";
			$scope.data.state="error";
			break;
		}
		$scope.$apply();
	});
}); 

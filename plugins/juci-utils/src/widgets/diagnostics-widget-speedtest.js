/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Reidar Cederqvist <reidar.cederqvist@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

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
	});

	function getServers(){
		$scope.allTestServers = $scope.testServers.map(function(x){
			return {
				label: x.server.value + "/" + x.port.value, 
				value: x.server.value
			}
		});
		if($scope.allTestServers.length)
			$scope.data.server = $scope.allTestServers[0].value; 
	}

	$scope.testType = [
		{value:"up_down", label: "up and down"}, 
		{value:"up", label: "up"}, 
		{value:"down", label:"down"} 
	];

	$uci.$sync("speedtest").done(function(){
		$scope.testServers = $uci.speedtest["@testserver"];
		getServers();
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
				$scope.data.state="running";
			}else{
				$scope.data.state="";
			}
			$scope.$apply();
		});
	};
	
	$scope.onRemoveAddress = function(){
		var server = $scope.testServers.filter(function(x){
			return $scope.data.server == x.server.value
		});
		if(!server){
			alert("error deleting server");
			return;
		}
		server.$delete().done(function(){
			$uci.$save().done(function(){
				getServers();
				$scope.$apply();
			});
		});
	};

	$scope.onAddAddress = function(){
		utilsAddTestserverPicker.show().done(function(data){
			if(!data)return;
			$uci.speedtest.$create({
				".type": "testserver",
				"server": data.address,
				"port": data.port
			}).done(function(){
				$uci.$save().done(function(){
					getServers();
					$scope.$apply();
				});
			});
		});
	}
	$events.subscribe("juci.utils.speedtest", function(res){
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

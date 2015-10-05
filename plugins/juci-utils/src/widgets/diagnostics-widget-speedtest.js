//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("diagnosticsWidget90Speedtest", function($compile, $parse){
	return {
		templateUrl: "/widgets/diagnostics-widget-speedtest.html",
		controller: "diagnosticsWidget90Speedtest", 
	 };  
})
.controller("diagnosticsWidget90Speedtest", function($scope, $rpc, $events, $uci){
	$scope.packagesize = 50000;
	$scope.testType = [{value:"up_down", label: "up and down"}, {value:"up", label: "up"}, {value:"down", label:"down"} ];
	$scope.addresses = [{label:"tptest.bredband.net/1640"}, {label:"tptest.elion.ee/1550"}];
	$uci.$sync("speedtest").done(function(){
		$scope.testServers = $uci.speedtest["@testserver"];
		$scope.allTestServers = $scope.testServers.map(function(x){
			return {
				label: x.server.value + "/" + x.port.value, 
				value: x[".name"]
			}
		});
		$scope.server = $scope.allTestServers[0];
		$scope.$apply();
	});
	$scope.runTest = function(){
		window.alert($scope.server.value);
	}
}); 

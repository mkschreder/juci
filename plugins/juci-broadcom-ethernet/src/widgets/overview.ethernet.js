JUCI.app
.directive("overviewStatusWidget01Ethernet", function(){
	return {
		templateUrl: "/widgets/overview.ethernet.small.html",
		controller: "overviewWidgetEthernet",
		replace: true
	};
})
.controller("overviewWidgetEthernet", function($scope, $ethernet){
	$scope.ethPorts = [];
	JUCI.interval.repeat("overview-status-widget-ethernet", 1000, function(done){
		$ethernet.getAdapters().done(function(adapters){
			$scope.ethPorts = adapters.filter(function(a){ return a.type == "eth-port"; }).sort(function(port){
				if(port.name == "WAN") return 1;
				return 0;
			});
			$scope.$apply();
		}).always(function(){done();});
	});
	$scope.getState = function(port){
		var flags = port.flags.split(",");
		if(flags.find(function(flag){ return flag == "DOWN" })) return "error";
		if(flags.find(function(flag){ return flag == "NO-CARRIER" })) return "default";
		return "success";
	};
	$scope.getName = function(port){
		if(port.name == "WAN") return "W";
		return "L"+port.name.slice(-1);
	};
});

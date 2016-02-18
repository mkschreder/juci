JUCI.app
.controller("printerPageCtrl", function($scope, $uci, $firewall){
	$uci.$sync("p910nd").done(function(){
		$scope.allPrinters = $uci.p910nd["@p910nd"];
		$firewall.getZoneNetworks("lan").done(function(data){
			$scope.allLanInterfaces = data.map(function(iface){ return { label: String(iface[".name"]).toUpperCase(), value: iface[".name"]} });
			$scope.$apply();
		});
	});
	$scope.allPorts = [];1
	for(var i = 0; i < 10; i++){ $scope.allPorts.push({ label: "910" + i, value: 9100 + i })}
});

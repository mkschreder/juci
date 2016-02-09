JUCI.app
.controller("printerPageCtrl", function($scope, $uci){
	$uci.$sync("p910nd").done(function(){
		$scope.printers = $uci.p910nd["@p910nd"];
		$scope.allLanInterfaces = [];
		$scope.allPorts = [];
		$scope.$apply();
	});
});

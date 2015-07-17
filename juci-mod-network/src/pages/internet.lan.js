JUCI.app
.controller("InternetLanPage", function($scope, $uci, $network, $config){
	$network.getDevices().done(function(devices){
		$scope.devices = devices; 
		$network.getNetworks().done(function(nets){
			$scope.networks = nets.filter(function(x){ return x.is_lan.value == true }); 
			$scope.$apply(); 
			//drawCyGraph(); 
		}); 
	}); 
}); 

JUCI.app
.controller("SettingsNetworkCtrl", function($scope, $uci, $network){
	$network.getNetworks().done(function(nets){
		$scope.interfaces = nets.filter(function(i){ return i.type.value != "" && i.is_lan.value == true}); 
		$scope.$apply(); 
	}); 
}); 

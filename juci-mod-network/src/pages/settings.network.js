JUCI.app
.controller("SettingsNetworkCtrl", function($scope, $uci){
	$uci.sync("network").done(function(){
		$scope.network = $uci.network; 
		$scope.interfaces = $uci.network['@interface'].filter(function(i){ return i.type.value != "" && i.is_lan.value == true}); 
		$scope.$apply(); 
	}); 
}); 

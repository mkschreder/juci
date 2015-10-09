//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetServicesNTPPage", function($scope, $rpc, $uci, $tr, gettext){
	$uci.$sync("system").done(function(){
		if(!$uci.system.ntp) return; 
		$scope.ntp = $uci.system.ntp.server.value.map(function(x){ return { server: x }; }); 
		$scope.$apply(); 
		$scope.$watch("ntp", function(){
			$uci.system.ntp.server.value = []; 
			$scope.ntp.map(function(ntp){
				$uci.system.ntp.server.value.push(ntp.server); 
			}); 
		}, true); 
	}); 
	$scope.onDeleteNTPServer = function(ntp){
		$scope.ntp = $scope.ntp.filter(function(x){ return x != ntp; }); 
	}
	$scope.onAddNTPServer = function(){
		if(!$uci.system.ntp) return; 
		$scope.ntp.push({ server: "" }); 
	}
}); 

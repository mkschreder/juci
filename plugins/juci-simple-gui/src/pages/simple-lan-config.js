//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("simpleLANConfigPage", function($scope, $uci, $config){
	$uci.$sync("network").done(function(){
		$scope.lan = $uci.network[$config.settings.simplegui.lan_network.value]; 
		$scope.$apply(); 
	}); 
}); 

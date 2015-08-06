//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusNATPageCtrl", function($scope, $rpc, $tr, $network, gettext){
	$network.getNetworkLoad().done(function(load){
		$scope.load = load; 
		$scope.$apply(); 
	});
	
	$network.getNatTable().done(function(table){
		$scope.connections = table.sort(function(a, b){ return (a.src+a.dest) < (b.src+b.dest); }).map(function(x){
			switch(x.protocol){
				case 6: x.protocol = "TCP"; break; 
				case 2: x.protocol = "UNIX"; break; 
				case 17: x.protocol = "UDP"; break; 
			}
			return x; 
		}); 
		$scope.$apply(); 
	}); 
}); 

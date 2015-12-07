//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetLANRoutesPage", function($scope, $uci, $network){
	$network.getNetworks().done(function(lans){
		$scope.routes = $uci.network["@route"]; 
		$scope.routes6 = $uci.network["@route6"]; 
		$scope.allNetworks = lans.filter(function(net){
			return net[".name"] != "loopback"; 
		}).map(function(net){
			return { label: net[".name"], value: net[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	
	$scope.onAddRoute = function(){
		$uci.network.create({
			".type": "route"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

	$scope.onDeleteRoute = function(route){
		if(!route) return; 
		route.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onAddRoute6 = function(){
		$uci.network.create({
			".type": "route6"
		}).done(function(route){
			$scope.$apply(); 
		}); 
	}

}); 

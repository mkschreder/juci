//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("InternetFirewallForwardingPage", function($scope, $uci, $firewall, $config){
	$scope.data = {}; 
	$firewall.getZones().done(function(zones){
		$uci.sync("firewall").done(function(){
			var forwards = []; 
			zones.map(function(src){
				zones.map(function(dst){
					if(src.name.value == dst.name.value) return; 
					var fwd = $uci.firewall["@forwarding"].find(function(x){ return x.src.value == src.name.value && x.dest.value == dst.name.value; }); 
					forwards.push({
						title: src.name.value + " -- > "+dst.name.value, 
						enabled: fwd != null, 
						src: src.name.value, 
						dst: dst.name.value, 
						base: fwd
					}); 
				}); 
			}); 
			$scope.forwards = forwards; 
			$scope.$apply(); 
		}); 
	}); 
	$scope.onToggleForward = function(){
		$scope.forwards.map(function(fwd){
			if(fwd.enabled && !fwd.base){
				$uci.firewall.create({
					".type": "forwarding", 
					"src": fwd.src, 
					"dest": fwd.dst
				}).done(function(section){
					fwd.base = section; 
					$scope.$apply(); 
				}); 
			} else if(!fwd.enabled && fwd.base){
				fwd.base.$delete().done(function(){
					fwd.base = null; 
					$scope.$apply(); 
				}); 
			}
		}); 
	}
}); 

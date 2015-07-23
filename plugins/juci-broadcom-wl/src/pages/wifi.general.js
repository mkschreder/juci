//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiGeneralPageCtrl", function($scope, $uci, $wireless){
	$wireless.getInterfaces().done(function(ifaces){
		$wireless.getDevices().done(function(devs){
			$scope.interfaces = ifaces; 
			$scope.interfaces.map(function(i){
				i.$device = devs.find(function(x){ return x[".name"] == i.device.value; }); 
			}); 
			$scope.status = $uci.wireless.status; 
			if($uci.boardpanel) 
				$scope.boardpanel = $uci.boardpanel; 
			$scope.$apply(); 
		}); 
	}); 
	/*
	async.series([
		function(next){
			$uci.sync(["wireless", "boardpanel"]).done(function(){
				if(!$uci.wireless.status){
					$uci.wireless.create({
						".type": "wifi-status", 
						".name": "status", 
						disabled: false, 
						button_enabled: false
					}).done(function(section){
						$scope.status = section; 
						$uci.save().done(function(){
							next();
						}).fail(function(){
							throw new Error("Could not create missing wifi-settings section!"); 
						}); 
					}).always(function(){
						next(); 
					}); 
				} else {
					next(); 
				}
			}); 
		}, 
		function(next){
			$scope.interfaces = $uci.wireless['@wifi-iface']; 
			$scope.status = $uci.wireless.status; 
			if($uci.boardpanel) 
				$scope.boardpanel = $uci.boardpanel; 
			$scope.$apply(); 
			
			next(); 
		}
	]); */
	// for automatically saving switch state
	$scope.onApply = function(){
		$uci.save(); 
	}
}); 

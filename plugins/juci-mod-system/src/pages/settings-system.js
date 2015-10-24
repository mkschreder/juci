//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("SettingsSystemGeneral", function($scope, $rpc, $uci, $tr, gettext){
	async.series([
		function(next){
			$uci.$sync("system").done(function(){
				if($uci.system["@system"] && $uci.system["@system"].length)
					$scope.system = $uci.system["@system"][0]; 
				next(); 
			}); 
		}, 
		function(next){
			$rpc.juci.system.time.zonelist().done(function(result){
				if(result && result.zones){
					$scope.allTimeZones = Object.keys(result.zones).map(function(k){
						return { label: k, value: result.zones[k] }; 
					}); 
				}
				next(); 
			}); 
		}
	], function(){
		$scope.$apply(); 
	}); 
	
	JUCI.interval.repeat("system.time", 1000, function(done){
		$rpc.juci.system.time.get().done(function(result){
			$scope.localtime = (new Date(result.unix_time * 1000)).toLocaleString(); 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
	
	$scope.setRouterTimeToBrowserTime = function(){
		$rpc.juci.system.time.set({ unix_time: Math.floor((new Date()).getTime() / 1000) }).done(function(){
			
		}); 
	}; 
}); 


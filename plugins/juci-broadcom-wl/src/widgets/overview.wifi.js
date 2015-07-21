//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("overviewWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.html", 
		controller: "overviewWidgetWifi", 
		replace: true
	 };  
})
.directive("overviewStatusWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.small.html", 
		controller: "overviewStatusWidgetWifi", 
		replace: true
	 };  
})
.controller("overviewStatusWidgetWifi", function($scope, $uci, $rpc){
	JUCI.interval.repeat("overview-wireless", 1000, function(done){
		async.series([function(next){
			$uci.sync(["wireless"]).done(function(){
				$scope.wireless = $uci.wireless;  
				if($uci.wireless && $uci.wireless.status) {
					if($uci.wireless.status.wlan.value){
						$scope.statusClass = "text-success"; 
					} else {
						$scope.statusClass = "text-default"; 
					}
				}
				$scope.$apply(); 
				next(); 
			}); 
		}, function(next){
			$rpc.router.clients().done(function(clients){
				$scope.wifiClients = Object.keys(clients).map(function(x) { return clients[x]; }).filter(function(x){
					return x.connected && x.wireless == true; 
				}).length; 
			}); 
		}], function(){
			done(); 
		}); 
	}); 
	
})
.controller("overviewWidgetWifi", function($scope, $rpc, $uci){
	$scope.wireless = {
		clients: []
	}; 
	
	$scope.onWPSToggle = function(){
		$uci.wireless.status.wps.value = !$uci.wireless.status.wps.value; 
		$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}
	$scope.onWIFISchedToggle = function(){
		$uci.wireless.status.schedule.value = !$uci.wireless.status.schedule.value; 
		$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
		$uci.save().done(function(){
			refresh(); 
		}); 
	}
	
	function refresh() {
		$scope.wifiSchedStatus = gettext("off"); 
		$scope.wifiWPSStatus = gettext("off"); 
		async.series([
			function(next){
				$uci.sync(["wireless"]).done(function(){
					$scope.wifi = $uci.wireless;  
					if($uci.wireless && $uci.wireless.status) {
						$scope.wifiSchedStatus = (($uci.wireless.status.schedule.value)?gettext("on"):gettext("off")); 
						$scope.wifiWPSStatus = (($uci.wireless.status.wps.value)?gettext("on"):gettext("off")); 
					}
				}).always(function(){ next(); }); 
			}, 
			function(next){
				$rpc.router.clients().done(function(clients){
					var all = Object.keys(clients).map(function(x) { return clients[x]; }); 
					$scope.wireless.clients = all.filter(function(x){
						return x.connected && x.wireless == true; 
					}); 
					next(); 
				}).fail(function(){
					next();
				});; 
			},
		], function(){
			$scope.$apply(); 
		}); 
	} refresh(); 
}); 

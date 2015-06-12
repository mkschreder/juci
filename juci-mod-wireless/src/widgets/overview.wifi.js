JUCI.app
.directive("overviewWidget00Wifi", function(){
	return {
		templateUrl: "widgets/overview.wifi.html", 
		controller: "overviewWidgetWifi", 
		replace: true
	 };  
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

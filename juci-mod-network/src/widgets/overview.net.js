JUCI.app
.directive("overviewWidget10Network", function(){
	return {
		templateUrl: "widgets/overview.net.html", 
		controller: "overviewWidgetNetwork", 
		replace: true
	 };  
})
.controller("overviewWidgetNetwork", function($scope, $rpc, $uci, $config, $tr, gettext){
	$scope.defaultHostName = $tr(gettext("Unknown")); 
	async.series([
	function(next){
		$rpc.network.interface.dump().done(function(interfaces){
			var conn = ""; 
			if(interfaces && interfaces.interface){
				var i = interfaces.interface.find(function(x){
					return x.interface == $config.wan_interface; 
				})
				if(i){
					var dev = i.l3_device||i.device||""; 
					if(dev.indexOf("atm") == 0) conn = "ADSL"; 
					else if(dev.indexOf("ptm") == 0) conn = "VDSL"; 
					else if(dev.indexOf("eth") == 0) conn = "FTTH"; 
					else if(dev.indexOf("wwan") == 0) conn = "LTE"; 
					else if(dev.indexOf("wl") == 0) conn = "Wi-Fi"; 
					else conn = $tr(gettext("Network")); 
				}
			} 
			$scope.wan_type = conn; 
		}).always(function(){ next(); }); 
	}, 
	function(next){
		$rpc.router.clients().done(function(clients){
			//alert(JSON.stringify(Object.keys(clients).map(function(x) { return clients[x]; }))); 
			var all = Object.keys(clients).map(function(x) { return clients[x]; }); 
			$scope.clients = all.filter(function(x){
				return x.connected && x.wireless == false; 
			}); 
			next(); 
		}).fail(function(){
			next();
		});; 
	}], function(){
		$scope.$apply(); 
	}); 
}); 

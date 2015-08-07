//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("overviewWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	 };  
})
.directive("overviewStatusWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan-small.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	 };  
})
.controller("overviewWidgetWAN", function($scope, $uci, $rpc, $firewall){
	$scope.statusClass = "text-success"; 
	JUCI.interval.repeat("overview-wan", 2000, function(done){
		$rpc.network.interface.dump().done(function(result){
			var interfaces = result.interface; 
			$firewall.getZones().done(function(zones){
				var wan = zones.find(function(x){ return x.name.value == "wan"; }); 
				if(!wan) { done(); return; }; 
				var wan_ifs = interfaces.filter(function(x){
					return wan.network.value.find(function(net) { return net == x.interface; }); 
				}); 
				$scope.internet_wan = wan_ifs.find(function(x){ return x.route && x.route[0] && x.route[0].target == "0.0.0.0"; }); 
				if($scope.internet_wan){
					var con_type = "ETH"; 
					if($scope.internet_wan.device.match(/atm/)) con_type = "ADSL"; 
					else if($scope.internet_wan.device.match(/ptm/)) con_type = "VDSL"; 
					else if($scope.internet_wan.device.match(/wwan/)) con_type = "3G/4G"; 
					$scope.internet_wan.connection_type = con_type; 
				} else {
					$scope.internet_wan = {}; 
				}
				$scope.wan_ifs = wan_ifs; 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
});

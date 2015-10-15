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
				var default_route_ifs = wan_ifs.filter(function(x){ 
					return x.route && x.route.length && 
						(x.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; }));
				}); 
				var con_types = {}; 
				var all_gateways = {}; 
				default_route_ifs.map(function(i){
					var con_type = "ETH"; 
					if(i.l3_device.match(/atm/)) con_type = "ADSL"; 
					else if(i.l3_device.match(/ptm/)) con_type = "VDSL"; 
					else if(i.l3_device.match(/wwan/)) con_type = "3G/4G"; 
					con_types[con_type] = con_type; 
					i.route.map(function(r){
						if(r.nexthop != "0.0.0.0" && r.nexthop != "::") // ignore dummy routes. Note that current gateways should actually be determined by pinging them, but showing all of them is sufficient for now. 
							all_gateways[r.nexthop] = true; 
					}); 
				}); 
				$scope.connection_types = Object.keys(con_types); 
				$scope.all_gateways = Object.keys(all_gateways); 
				$scope.default_route_ifs = default_route_ifs; 
				$scope.wan_ifs = wan_ifs; 
				$scope.$apply(); 
				done(); 
			}); 
		}); 
	}); 
});

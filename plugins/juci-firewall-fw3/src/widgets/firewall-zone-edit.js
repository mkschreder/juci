JUCI.app
.directive("firewallZoneEdit", function(){
	return {
		scope: {
			zone: "=ngModel"
		}, 
		controller: "firewallZoneEdit", 
		templateUrl: "/widgets/firewall-zone-edit.html"
	}; 
})
.controller("firewallZoneEdit", function($scope, $firewall, gettext, $network){
	$scope.policys = [
		{ label: gettext("ACCEPT"), value: "ACCEPT" }, 
		{ label: gettext("REJECT"), value: "REJECT" }, 
		{ label: gettext("FORWARD"), value: "FORWARD" }
	]; 
	
	$scope.$watch("zone", function(zone){
		if(!zone) return; 
		$network.getNetworks().done(function(nets){
			if(!zone || !zone.network) return; 
			$scope.networks = zone.network.value.map(function(name){
				var net = nets.find(function(x){ return x[".name"] == name; }); 
				if(!net) return null; 
				return net; 
			}).filter(function(x){ return x != null; }); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.getItemTitle = function(net){
		return net[".name"]; 
	}
}); 

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("PageBroadcomIptv", function($scope, $uci, gettext, $network){
	$scope.networks = {
		selected: []
	};
	$uci.$sync("mcpd").done(function(){
		$scope.mcpd = $uci.mcpd.mcpd;
		var proxy_interfaces = $scope.mcpd.igmp_proxy_interfaces.value.split(" ");
		$network.getNetworks().done(function(nets){
			$scope.networks.all = nets.map(function(net){
				return { 
					name:net[".name"], 
					ticked: (proxy_interfaces.indexOf(net[".name"]) > -1)
				}
			});
			$scope.$apply(); 
		});
	}); 
	$scope.$watch('networks', function(){
		if(!$scope.networks.selected || !$scope.mcpd) return;
		$scope.mcpd.igmp_proxy_interfaces.value = $scope.networks.selected.map(function(x){return x.name}).join(" ");	
	}, true);
}); 

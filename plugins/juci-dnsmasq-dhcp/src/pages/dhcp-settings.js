//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.controller("dhcpSettingsPage", function($scope, $uci){
	$uci.$sync(["dhcp"]).done(function(){
		$scope.dnsmasq = $uci.dhcp["@dnsmasq"][0];
		$scope.hostfiles = $scope.dnsmasq.addnhosts.value.map(function(x){
			return { label: x };
		});
		$scope.bogusnxdomain = $scope.dnsmasq.bogusnxdomain.value.map(function(host){ return { label: host }});
		$scope.server = $scope.dnsmasq.server.value.map(function(server){ return { label: server }});
		$scope.rebind_domain = $scope.dnsmasq.rebind_domain.value.map(function(domain){ return { label: domain }});
		$scope.$apply();
	});	
	$scope.$watch("rebind_domain", function(){
		if(!$scope.server) return;
		$scope.dnsmasq.rebind_domain.value = $scope.rebind_domain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("server", function(){
		if(!$scope.server) return;
		$scope.dnsmasq.server.value = $scope.server.map(function(x){ return x.label });
	}, true);
	$scope.$watch("bogusnxdomain", function(){
		if(!$scope.bogusnxdomain) return;
		$scope.dnsmasq.bogusnxdomain.value = $scope.bogusnxdomain.map(function(x){ return x.label });
	}, true);
	$scope.$watch("hostfiles", function(){
		if(!$scope.hostfiles) return;
		$scope.dnsmasq.addnhosts.value = $scope.hostfiles.map(function(x){return x.label});
	}, true);
	$scope.on_port_change = function(option){
		if($scope.dnsmasq[option] && $scope.dnsmasq[option].value){
			$scope.dnsmasq[option].value = $scope.dnsmasq[option].value.replace(/[^0-9]/g, "");
		}
	};
});

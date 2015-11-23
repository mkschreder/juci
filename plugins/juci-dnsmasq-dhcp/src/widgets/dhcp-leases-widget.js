//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com
	<th translate>
JUCI.app
.directive("juciDhcpLeasesWidget", function(){
	return {
		scope: true,
		templateUrl: "/widgets/dhcp-leases-widget.html",
		controller:	"dhcpLeasesWidget"
	}
})
.controller("dhcpLeasesWidget", function($rpc, $uci, $scope){
	$rpc.juci.dhcp.ipv4leases().done(function(data){
		$scope.ipv4leases = data;
		console.log(data);
	});
	$uci.$sync(["dhcp"], function(){
		$scope.dhcp = $uci.dhcp["@host"];
		console.log($scope.dhcp);
	});
});

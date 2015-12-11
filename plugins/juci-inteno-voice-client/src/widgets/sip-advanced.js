//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciSipAdvanced", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-advanced.html",
		replace: true,
		controller: "sipAdvancedCtrl"
	};
}).controller("sipAdvancedCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync("voice_client").done(function(){
		$scope.sip = $uci.voice_client.SIP; 
		$scope.proxys = $scope.sip.sip_proxy.value.map(function(x){return {label: x}});
		$scope.$apply();
	});
	$scope.onProxyAdded = function(){
		$scope.sip.sip_proxy.value = $scope.proxys.map(function(x){return x.label});
	};
});

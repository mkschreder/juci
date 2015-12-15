//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciSipServiceProvider", function(){
	return {
		scope: true,
		templateUrl: "widgets/sip-service-provider.html",
		replace: true,
		controller: "sipServiceProviderCtrl"
	};
}).controller("sipServiceProviderCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync(["voice_client"]).done(function(){
		$scope.providers = $uci.voice_client["@sip_service_provider"];
		$scope.$apply();
	});
	$scope.onAddProvider = function(){
		return true;
	};
	$scope.onDeleteProvider = function(item){
		return true;
	};
	$scope.getProviderTitle = function(item){
		return title = (item.name.value == '') ? item.user.value : item.name.value;
	};
	$scope.targets = [{ label: $tr(gettext("Direct")),	value: "direct"  }];
});

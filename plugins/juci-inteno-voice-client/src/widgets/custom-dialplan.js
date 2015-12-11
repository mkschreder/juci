//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciCustomDialplan", function(){
	return {
		scope: true,
		templateUrl: "widgets/custom-dialplan.html",
		replace: true,
		controller: "customDialplanCtrl"
	};
}).controller("customDialplanCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync("voice_client").done(function(){
		$scope.dialplan = $uci.voice_client.custom_dialplan; 
		$scope.$apply();
	});
});

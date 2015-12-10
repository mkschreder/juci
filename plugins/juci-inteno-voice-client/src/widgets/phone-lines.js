//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 
JUCI.app
.directive("juciPhoneLines", function(){
	return {
		scope: true,
		templateUrl: "widgets/phone-lines.html",
		replace: true,
		require: "^ngModel",
		controller: "phoneLineCtrl"
	};
}).controller("phoneLineCtrl", function($scope, $uci, $tr, gettext){
	$uci.$sync("voice_client").done(function(){
		$scope.phone_lines = $uci.voice_client["@brcm_line"]; 
		$scope.phone_numbers = $uci.voice_client["@sip_service_provider"]; 
		$scope.allSipAccounts = $scope.phone_numbers.map(function(x){
			return {
				label: x.displayname.value||x.user.value||x.name.value, 
				value: x[".name"]
			}
		});  
		$scope.$apply(); 
	}); 
	$scope.vads = [
		{ label: $tr(gettext("Off")),			value: 0 },
		{ label: $tr(gettext("Transparent")),	value: 1 },
		{ label: $tr(gettext("Conservative")),	value: 2 },
		{ label: $tr(gettext("Aggressive")),	value: 3 }
	];
	$scope.noises = [
		{ label: $tr(gettext("Off")),				value: 0 },
		{ label: $tr(gettext("White noise")),		value: 1 },
		{ label: $tr(gettext("Hot noise")),			value: 2 },
		{ label: $tr(gettext("Spectrum estimate")),	value: 3 }
	];
});

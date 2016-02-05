//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("sipUsersEdit", function(){
	return {
		templateUrl: "widgets/sip-users-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "sipUsersEditCtrl"
	};
}).controller("sipUsersEditCtrl", function($scope, $uci, $tr, gettext){
	$scope.showPassword = false;
	$scope.togglePassword = function(){$scope.showPassword = !$scope.showPassword;};
	$uci.$sync("voice_client").done(function(){
		$scope.mailbox = $uci.voice_client["@mailbox"];
		$scope.mbox = $scope.mailbox.map(function(x){
			return {
				label: x.name.value,
				value: x[".name"]
			}
		});
		$scope.mbox.unshift({ label: $tr(gettext("No Mailbox")), value: ""});
		$scope.providers = $uci.voice_client["@sip_service_provider"];
		$scope.provs = $scope.providers.map(function(x){
			return {
				label: x.name.value,
				value: x[".name"]
			}
		});
		$scope.provs.unshift({ label:$tr(gettext("No Account")), value: ""});
	});
	$scope.$watch("model", function onSipUsersModelChanged(){
		if(!$scope.model) return;
		fixCodecs();
	}, false);
	$scope.codecs = {};
	$scope.codecs.all = [
		{ label: $tr(gettext("Select Codec")),	value: "" },
		{ label: $tr(gettext("G 723.1")),		value: "g723" },
		{ label: $tr(gettext("GSM")),			value: "gsm" },
		{ label: $tr(gettext("G.711MuLaw")),	value: "ulaw" },
		{ label: $tr(gettext("G. 726")),		value: "g726" },
		{ label: $tr(gettext("iLBC")),			value: "ilbc" },
		{ label: $tr(gettext("G. 729a")),		value: "g729" },
		{ label: $tr(gettext("G.711ALaw")),		value: "alaw" }
	];

	var codecNames = ["codec0", "codec1", "codec2", "codec3", "codec4", "codec5", "codec6"];
	function fixCodecs(){
		for( var i = 0; i < 7; i++){
			if(i != 0 && $scope.model[codecNames[i-1]].value == "") break;
			$scope.codecs[codecNames[i]] = $scope.codecs.all.filter(function(x){
				for(var j = 0; j < i; j++){
					if($scope.model[codecNames[j]].value === x.value)return false;
				}
				return true;
			});
		}
	};
	$scope.updateCodecList = function(value, index){
		for(var i = index; i < 7; i++){
			$scope.model[codecNames[i]].value = "";
		}
		fixCodecs();
		if(index === 6) return;
		$scope.codecs[codecNames[index+1]] = $scope.codecs[codecNames[index]].filter(function(x){return (x.value == value) ? false: true;});
	};

});

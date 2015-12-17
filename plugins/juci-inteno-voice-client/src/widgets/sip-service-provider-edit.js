//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("sipServiceProviderEdit", function(){
	return {
		templateUrl: "widgets/sip-service-provider-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel",
		controller: "sipServiceProviderEditCtrl"
	};
}).controller("sipServiceProviderEditCtrl", function($scope, $uci, $tr, gettext){
	$scope.selected_lines = [];
	$uci.$sync("voice_client").done(function(){
		$scope.brcm_lines = $uci.voice_client["@brcm_line"];
		$scope.mailboxes = $uci.voice_client["@mailbox"];
		$scope.mboxes = $scope.mailboxes.map(function(x){ return { label:x.name.value, value:x[".name"] }});
		$scope.mboxes.unshift({ label: $tr(gettext("No Mailbox")),	value:"" });
		$scope.$apply();
	});
	var done = false;
	$scope.$watch("model", function(){
		if(!$scope.model || done) return;
		done = true;
		$scope.selected_lines = $scope.model.call_lines.value.split(" ").map(function(x){
			var name = String(x);
			var number = name.split("/").pop();
			return name.toLowerCase().substring(0, x.length-2) + number;
		});
		$scope.lines = $scope.brcm_lines.map(function(x){
			return {
				label:x.name.value,
				checked:($scope.selected_lines.indexOf(x[".name"]) > -1) ? true : false,
				value:x[".name"]
			};
		});
		fixCodecs();
	});
	$scope.onLineChange = function(line){
		$scope.model.call_lines.value = $scope.lines.filter(function(x){return x.checked}).map(function(x){
			return x.value.toUpperCase().slice(0, -1) + "/" + x.value.toUpperCase().slice(-1);
		}).join(" ");
	};
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
			if(i != 0 && $scope.model[codecNames[i-1]].value == "") {console.log(i);break;}
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
	$scope.showPtime = function(option){
		if($scope.model == undefined) return;
		for(var i = 0; i < 7; i++){
			if($scope.model[codecNames[i]].value === "") return false;
			if($scope.model[codecNames[i]].value === option) return true;
		}
		return false;
	};
	$scope.transportTypes = [
		{ label: $tr(gettext("UDP")),	value: "udp" },
		{ label: $tr(gettext("TCP")),	value: "tcp" },
		{ label: $tr(gettext("TLS")),	value: "tls" },
	];
	$scope.showPassword = false;
	$scope.togglePassword = function(){
		$scope.showPassword = !$scope.showPassword;
	}
});

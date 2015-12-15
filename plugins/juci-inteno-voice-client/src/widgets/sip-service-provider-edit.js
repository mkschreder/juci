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
	});
	$scope.onLineChange = function(line){
		$scope.model.call_lines.value = $scope.lines.filter(function(x){return x.checked}).map(function(x){
			return x.value.toUpperCase().slice(0, -1) + "/" + x.value.toUpperCase().slice(-1);
		}).join(" ");
	};
});

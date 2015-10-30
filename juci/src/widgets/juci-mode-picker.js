//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciModePicker", function($compile){
	return {
		templateUrl: "/widgets/juci-mode-picker.html", 
		controller: "juciModePicker", 
		replace: true
	 };  
})
.controller("juciModePicker", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, $tr, gettext){
	$scope.selectedModeValue = $localStorage.getItem("mode") || "basic";
	$scope.guiModes = [
		{label: $tr(gettext("Basic Mode")), value: "basic"},
		{label: $tr(gettext("Expert Mode")), value: "expert"},
	];   
	$scope.onChangeMode = function(selected){
		$scope.selectedModeValue = selected; 
		console.log("selected value", selected);
		$localStorage.setItem("mode", selected);
		$config.local.mode = selected;
		$state.reload();
	};
}); 

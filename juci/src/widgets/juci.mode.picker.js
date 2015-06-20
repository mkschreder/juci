//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciModePicker", function($compile){
	return {
		templateUrl: "/widgets/juci.mode.picker.html", 
		controller: "juciModePicker", 
		replace: true
	 };  
})
.controller("juciModePicker", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, gettext){
	$scope.selectedModeValue = $localStorage.getItem("mode") || "basic";
	$scope.guiModes = [
		{label: gettext("Basic Mode"), value: "basic"},
		{label: gettext("Expert Mode"), value: "expert"},
		{label: gettext("Log out"), value: "logout"}
	];   
	$scope.onChangeMode = function(selected){
		$scope.selectedModeValue = selected; 
		console.log("selected value", selected);
		if(selected == "logout") {
			console.log("logging out");
			$rpc.$logout().always(function(){
				$window.location.href="/";
			});
		} else {
			$localStorage.setItem("mode", selected);
			$config.mode = selected;
			$state.reload();
		}
	};
}); 

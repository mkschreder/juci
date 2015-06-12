//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciTopBar", function($compile){
	return {
		templateUrl: "/widgets/juci.top_bar.html", 
		controller: "juciTopBarController", 
		replace: true
	 };  
})
.controller("juciTopBarController", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, gettext){
	$scope.model = $config.hardware_model; 
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

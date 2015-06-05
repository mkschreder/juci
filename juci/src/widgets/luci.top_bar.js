$juci.module("core")
.directive("luciTopBar", function($compile){
	return {
		templateUrl: "/widgets/luci.top_bar.html", 
		controller: "luciTopBarController", 
		replace: true
	 };  
})
.controller("luciTopBarController", function($scope, $config, $uci, $rpc, $window, $localStorage, $state, gettext){
	$uci.sync("system").done(function(){
		var system = $uci.system["@system"]; 
		if(system && system.length && system[0].displayname.value){
			$scope.model = system[0].displayname.value; 
		} else {
			$scope.model = ($config.system.name || "") + " " + ($config.system.hardware || ""); 
		}
		$scope.$apply(); 
	}); 
	$scope.selectedModeValue = "basic";
	$scope.guiModes = [
		{label: gettext("Basic Mode"), value: "basic"},
		{label: gettext("Expert Mode"), value: "expert"},
		{label: gettext("Log out"), value: "logout"}
	];   
	$scope.onChangeMode = function(){
		var selected = $scope.selectedModeValue;
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

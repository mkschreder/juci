//! Author: Stefan Nygren <Stefan.Nygren@hiq.se>
JUCI.app
.directive("dropbearSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/dropbear-settings-edit.html",
		scope: {
			dropbear: "=ngModel"
		},
		replace: true,
		controller: "dropbearSettingsEdit",
		require: "^ngModel"
	};
}).controller("dropbearSettingsEdit", function($scope, $rpc, $network){
	$network.getNetworks().done(function(res) {
		$scope.interfaces = res.map(function(x) { return {label:x[".name"].toUpperCase(),value:x[".name"]};});
		$scope.interfaces.push({label:"LOOPBACK",value:"loopback"});
		$scope.interfaces.push({label:"ANY",value:""});
		$scope.$apply();
	});
});


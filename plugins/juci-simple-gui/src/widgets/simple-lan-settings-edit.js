//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("simpleLanSettingsEdit", function(){
	return {
		templateUrl: "/widgets/simple-lan-settings-edit.html",
		scope: {
			model: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("simpleLanSettingsEdit", function(){
	return {
		templateUrl: "/widgets/simple-lan-settings-edit.html",
		scope: {
			lan: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

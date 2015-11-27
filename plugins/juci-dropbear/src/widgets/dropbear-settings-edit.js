//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
JUCI.app
.directive("dropbearSettingsEdit", function($compile, $parse){
	return {
		templateUrl: "/widgets/dropbear-settings-edit.html",
		scope: {
			dropbear: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

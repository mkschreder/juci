//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>
$juci.module("core")
.directive("juciInputRadio", function () {
	var plugin_root = $juci.module("core").plugin_root;
	return {
		templateUrl: plugin_root + "/widgets/juci.input.radio.html",
		restrict: 'E',
		replace: true,
		scope: {
			label: "@",
			value: "=",
			ngModel: "="
		}
	};
});

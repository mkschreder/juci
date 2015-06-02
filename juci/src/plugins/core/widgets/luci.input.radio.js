$juci.module("core")
.directive("luciInputRadio", function () {
	var plugin_root = $juci.module("core").plugin_root;
	return {
		templateUrl: plugin_root + "/widgets/luci.input.radio.html",
		restrict: 'E',
		replace: true,
		scope: {
			label: "@",
			value: "=",
			ngModel: "="
		}
	};
});

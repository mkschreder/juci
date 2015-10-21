//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("juciInputRadio", function () {
	return {
		templateUrl: "/widgets/juci-input-radio.html",
		restrict: 'E',
		replace: true,
		scope: {
			label: "@",
			value: "=",
			ngModel: "="
		}
	};
});

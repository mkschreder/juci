//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciInputIpv6Address", function () {
	return {
		templateUrl: "/widgets/juci-input-ipv6-address.html",
		controller: "juciInputIpv6Address",
		restrict: 'E',
		scope: {
				placeholder: "@",
				address: "=ngModel"
		},
		require: "ngModel"
	};
})
.controller("juciInputIpv6Address", function($scope, $attrs, $parse, $uci){
	$scope.validate = function(field){
		if(field && field != "" && !field.match("^((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*::((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4}))*|((?:[0-9A-Fa-f]{1,4}))((?::[0-9A-Fa-f]{1,4})){7}$")) return gettext("Aaddress must be a valid IPv6 address"); 
		return null; 
	}
});

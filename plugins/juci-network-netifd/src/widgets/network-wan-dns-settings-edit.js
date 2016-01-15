//! Author: Reidar Cederqivst <reidar.cederqvist@gmail.com>

JUCI.app
.directive("networkWanDnsSettingsEdit", function(){
	return {
		templateUrl: "/widgets/network-wan-dns-settings-edit.html",
		scope: {
			wan_ifs: "=ngModel"
		},
		replace: true,
		require: "^ngModel"
	};
});

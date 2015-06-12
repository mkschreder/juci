//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("uciWirelessInterface", function($compile){
	var plugin_root = $juci.module("wifi").plugin_root; 
	return {
		templateUrl: plugin_root+"/widgets/uci.wireless.interface.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "WifiInterfaceController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiInterfaceController", function($scope, $uci, $tr, gettext){
	$scope.errors = []; 
	$scope.$on("error", function(ev, err){
		ev.stopPropagation(); 
		$scope.errors.push(err); 
	}); 
	$scope.$watch("interface", function(value){
		try {
			$scope.cryptoChoices = $scope.interface.encryption.schema.allow.map(function(x){
				return { label: $tr("wifi.enc."+x), value: x };
			}); 
		} catch(e) {} 
		$scope.devices = $uci.wireless["@wifi-device"].map(function(x){
			// TODO: this should be a uci "displayname" or something
			if(x.band.value == "a") x[".label"] = gettext("5GHz"); 
			else if(x.band.value == "b") x[".label"] = gettext("2.4GHz"); 
			return { label: x[".label"], value: x[".name"] };
		}); 
		$uci.wireless["@wifi-iface"].map(function(x){
			var dev = $uci.wireless[x.device.value]; 
			x[".frequency"] = dev[".label"]; 
		}); 
		$scope.title = "wifi-iface.name="+$scope.interface[".name"]; 
	});
	$scope.onPreApply = function(){
		$scope.errors.length = 0; 
	}
}); 

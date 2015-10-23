//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("openwrtWirelessInterfaceEdit", function($compile){
	return {
		scope: {
			iface: "=ngModel"
		}, 
		templateUrl: "/widgets/openwrt-wireless-interface-edit.html", 
		controller: "openwrtWirelessInterfaceEdit", 
		replace: true
	 };  
})
.controller("openwrtWirelessInterfaceEdit", function($scope, $wireless, $network, $tr, gettext, $uci){
	$scope.errors = []; 
	$scope.showPassword = true; 
	$scope.$on("error", function(ev, err){
		ev.stopPropagation(); 
		$scope.errors.push(err); 
	}); 
	$scope.keyChoices = [
		{label: $tr(gettext("Key")) + " #1", value: 1},
		{label: $tr(gettext("Key")) + " #2", value: 2},
		{label: $tr(gettext("Key")) + " #3", value: 3},
		{label: $tr(gettext("Key")) + " #4", value: 4}
	];
	$scope.psk2_ciphers = [
		{label: $tr(gettext("Auto")), value: "auto"},
		{label: $tr(gettext("CCMP (AES)")), value: "ccmp"}
	]; 
	$scope.mixed_psk_ciphers = [
		{label: $tr(gettext("Auto")), value: "auto"},
		{label: $tr(gettext("CCMP (AES)")), value: "ccmp"},
		{label: $tr(gettext("TKIP/CCMP (AES)")), value: "ccmp"}
	];  
	$network.getNetworks().done(function(nets){
		$scope.networks = nets.map(function(net){
			return { label: String(net[".name"]).toUpperCase(), value: net[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	$wireless.getDevices().done(function(devices){
		$scope.devices = devices.map(function(x){
			return { label: x[".frequency"], value: x[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	$scope.$watch("iface", function(value){
		if(!value) return; 
		try {
			$scope.cryptoChoices = [
				{ label: $tr(gettext("None")), value: "none" }, 
				{ label: $tr(gettext("WEP")), value: "wep" }, 
				{ label: $tr(gettext("WPA-PSK")), value: "psk" }, 
				{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed")), value: "psk-mixed" }, 
				{ label: $tr(gettext("WPA2-PSK")), value: "psk2" }, 
				{ label: $tr(gettext("WPA2 Enterprise")), value: "wpa2" }, 
				{ label: $tr(gettext("WPA-MIXED")), value: "wpa+mixed" }, 
			]; 
		} catch(e) {} 
	});
	$scope.$watch("iface.closed.value", function(value, oldvalue){
		if(!$scope.iface) return; 
		if(value && value != oldvalue){
			if($scope.iface.wps_pbc.value && !confirm(gettext("If you disable SSID broadcasting, WPS function will be disabled as well. You will need to enable it manually later. Are you sure you want to continue?"))){
				setTimeout(function(){
					$scope.iface.closed.value = oldvalue; 
					$scope.$apply(); 
				},0); 
			} else {
				$scope.iface.wps_pbc.value = false; 
			}
		}
	}); 
	
	$scope.onEncryptionChanged = function(value, oldvalue){
		if(!$scope.iface) return; 
		switch(value){
			case "none": {
				if(oldvalue && value != oldvalue){
					if(!confirm("WARNING: Disabling encryption on your router will severely degrade your security. Are you sure you want to disable encryption on this interface?")){
						setTimeout(function(){
							$scope.iface.encryption.value = oldvalue; 
							$scope.$apply(); 
						},0); 
					}
				}
				break; 
			}
			case "wep": 
			case "wep+shared": {
				if($scope.iface.wps_pbc.value && !confirm(gettext("WPS will be disabled when using WEP encryption. Are you sure you want to continue?"))){
					setTimeout(function(){
						$scope.iface.encryption.value = oldvalue; 
						$scope.$apply(); 
					},0); 
				} else {
					$scope.iface.wps_pbc.value = false; 
				}
				break; 
			}
			case "psk-mixed": {
				if(!$scope.mixed_psk_ciphers.find(function(i){ return i.value == $scope.iface.cipher.value}))
					$scope.iface.cipher.value = "ccmp"; 
				break; 
			}
			case "psk2": {
				if(!$scope.psk2_ciphers.find(function(i){ return i.value == $scope.iface.cipher.value}))
					$scope.iface.cipher.value = "ccmp"; 
				break; 
			}
		}; 
	}
	 
	$scope.onPreApply = function(){
		$scope.errors.length = 0; 
	}
	$scope.toggleShowPassword = function(){
		$scope.showPassword = !$scope.showPassword; 
	}

}); 

/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app
.directive("wirelessInterfaceEdit", function($compile){
	return {
		scope: {
			iface: "=ngModel"
		}, 
		templateUrl: "/widgets/wireless-interface-edit.html", 
		controller: "wirelessInterfaceEdit", 
		replace: true
	 };  
})
.controller("wirelessInterfaceEdit", function($scope, $config, $wireless, $network, $tr, gettext, $uci){
	$scope.errors = []; 
	$scope.showPassword = true; 
	$scope.$on("error", function(ev, err){
		ev.stopPropagation(); 
		$scope.errors.push(err); 
	}); 

	var allSupportedCryptoChoices = [
		{ label: $tr(gettext("None")), value: "none" }, 
		{ label: $tr(gettext("WEP Shared Key")), value: "wep+shared" }, 
		{ label: $tr(gettext("WEP Open System")), value: "wep+open" }, 
		{ label: $tr(gettext("WPA Personal (PSK)")), value: "psk" }, 
		{ label: $tr(gettext("WPA Personal (PSK + TKIP)")), value: "psk+tkip" }, 
		{ label: $tr(gettext("WPA Personal (PSK + CCMP)")), value: "psk+ccmp" }, 
		{ label: $tr(gettext("WPA Personal (PSK + AES)")), value: "psk+aes" }, 
		{ label: $tr(gettext("WPA Personal (PSK + TKIP + CCMP)")), value: "psk+tkip+ccmp" }, 
		{ label: $tr(gettext("WPA Personal (PSK + TKIP + AES)")), value: "psk+tkip+aes" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK)")), value: "psk2" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK + TKIP)")), value: "psk2+tkip" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK + CCMP)")), value: "psk2+ccmp" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK + AES)")), value: "psk2+aes" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK + TKIP + CCMP)")), value: "psk2+tkip+ccmp" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK + TKIP + AES)")), value: "psk2+tkip+aes" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode")), value: "psk-mixed" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode (TKIP)")), value: "psk-mixed+tkip" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode (CCMP)")), value: "psk-mixed+ccmp" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode (AES)")), value: "psk-mixed+aes" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode (TKIP + CCMP)")), value: "psk-mixed+tkip+ccmp" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode (TKIP + AES)")), value: "psk-mixed+tkip+aes" }, 
		{ label: $tr(gettext("WPA2 Enterprise")), value: "wpa2" }, 
		{ label: $tr(gettext("WPA2 Enterprise (TKIP)")), value: "wpa2+tkip" }, 
		{ label: $tr(gettext("WPA2 Enterprise (CCMP)")), value: "wpa2+ccmp" }, 
		{ label: $tr(gettext("WPA2 Enterprise (AES)")), value: "wpa2+aes" }, 
		{ label: $tr(gettext("WPA2 Enterprise (TKIP + CCMP)")), value: "wpa2+tkip+ccmp" }, 
		{ label: $tr(gettext("WPA2 Enterprise (TKIP + AES)")), value: "wpa2+tkip+aes" }, 
		{ label: $tr(gettext("WPA Enterprise")), value: "wpa" }, 
		{ label: $tr(gettext("WPA Enterprise (TKIP)")), value: "wpa+tkip" }, 
		{ label: $tr(gettext("WPA Enterprise (CCMP)")), value: "wpa+ccmp" }, 
		{ label: $tr(gettext("WPA Enterprise (AES)")), value: "wpa+aes" }, 
		{ label: $tr(gettext("WPA Enterprise (TKIP + CCMP)")), value: "wpa+tkip+ccmp" }, 
		{ label: $tr(gettext("WPA Enterprise (TKIP + AES)")), value: "wpa+tkip+aes" }, 
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode")), value: "wpa-mixed" },
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode (TKIP)")), value: "wpa-mixed+tkip" },
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode (CCMP)")), value: "wpa-mixed+ccmp" },
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode (AES)")), value: "wpa-mixed+aes" },
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode (TKIP + CCMP)")), value: "wpa-mixed+tkip+ccmp" },
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode (TKIP + AES)")), value: "wpa-mixed+tkip+aes" }
	]; 

	$scope.cryptoChoices = allSupportedCryptoChoices.filter(function(x){
		if($config.settings.wireless){
			return $config.settings.wireless.cryptochoices.value.indexOf(x.value) >= 0; 
		}
		return true; 
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

	$scope.$watch("iface.closed.value", function onWirelessInterfaceClosedChanged(value, oldvalue){
		if(!$scope.iface) return; 
		if(value && value != oldvalue){
			if($scope.iface.wps_pbc.value && !confirm(gettext("Disabling SSID broadcast will disable WPS. Continue?"))){
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
			case "psk2+ccmp": 
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

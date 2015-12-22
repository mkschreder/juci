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
.directive("uciWirelessInterface", function($compile){
	return {
		templateUrl: "/widgets/uci.wireless.interface.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "WifiInterfaceController", 
		replace: true, 
		require: "^ngModel"
	 };  
}).controller("WifiInterfaceController", function($scope, $uci, $tr, gettext, $wireless, $network){
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
	
	$scope.cryptoChoices = [
		{ label: $tr(gettext("None")), value: "none" }, 
		{ label: $tr(gettext("WEP")), value: "wep" }, 
		{ label: $tr(gettext("WPA2 Personal (PSK)")), value: "psk2" }, 
		{ label: $tr(gettext("WPA Personal (PSK)")), value: "psk" }, 
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode")), value: "mixed-psk" }, 
		{ label: $tr(gettext("WPA2 Enterprise")), value: "wpa2" }, 
		{ label: $tr(gettext("WPA Enterprise")), value: "wpa" }, 
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode")), value: "wpa-mixed" } 
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

	$scope.$watch("interface", function(value){
		if(!value) return; 
		//$scope.title = "wifi-iface.name="+$scope.interface[".name"]; 
	});

	$scope.$watch("interface.closed.value", function(value, oldvalue){
		if(!$scope.interface) return; 
		if(value && value != oldvalue){
			if($scope.interface.wps_pbc.value && !confirm(gettext("If you disable SSID broadcasting, WPS function will be disabled as well. You will need to enable it manually later. Are you sure you want to continue?"))){
				setTimeout(function(){
					$scope.interface.closed.value = oldvalue; 
					$scope.$apply(); 
				},0); 
			} else {
				$scope.interface.wps_pbc.value = false; 
			}
		}
	}); 
	
	$scope.onEncryptionChanged = function(value, oldvalue){
		if(!$scope.interface) return; 
		switch(value){
			case "none": {
				if(oldvalue && value != oldvalue){
					if(!confirm("WARNING: Disabling encryption on your router will severely degrade your security. Are you sure you want to disable encryption on this interface?")){
						setTimeout(function(){
							$scope.interface.encryption.value = oldvalue; 
							$scope.$apply(); 
						},0); 
					}
				}
				break; 
			}
			case "wep": 
			case "wep-shared": {
				if($scope.interface.wps_pbc.value && !confirm(gettext("WPS will be disabled when using WEP encryption. Are you sure you want to continue?"))){
					setTimeout(function(){
						$scope.interface.encryption.value = oldvalue; 
						$scope.$apply(); 
					},0); 
				} else {
					$scope.interface.wps_pbc.value = false; 
				}
				break; 
			}
			case "mixed-psk": {
				if(!$scope.mixed_psk_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "ccmp"; 
				break; 
			}
			case "psk2": {
				if(!$scope.psk2_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "ccmp"; 
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

// these are here just in order to make them available for translation
gettext("wifi-iface.device");
gettext("wifi-iface.network");
gettext("wifi-iface.mode");
gettext("wifi-iface.ssid");
gettext("wifi-iface.encryption");
gettext("wifi-iface.cipher");
gettext("wifi-iface.key");
gettext("wifi-iface.key1");
gettext("wifi-iface.key2");
gettext("wifi-iface.key3");
gettext("wifi-iface.key4");
gettext("wifi-iface.gtk_rekey");
gettext("wifi-iface.wps_pbc");
gettext("wifi-iface.wmf_bss_enable");
gettext("wifi-iface.bss_max");
gettext("wifi-iface.instance");
gettext("wifi-iface.up");
gettext("wifi-iface.closed");
gettext("wifi-iface.disabled");
gettext("wifi-iface.macmode");
gettext("wifi-iface.macfilter");
gettext("wifi-iface.maclist");
gettext("interface.macmode.allow");
gettext("interface.macmode.deny");
gettext("wifi.enc.none");
gettext("wifi.enc.wep");
gettext("wifi.enc.wep-shared");
gettext("wifi.enc.wpa2");
gettext("wifi.enc.mixed-wpa");
gettext("wifi.enc.psk");
gettext("wifi.enc.psk2");
gettext("wifi.enc.mixed-psk");

gettext("11b");
gettext("11g");
gettext("11bg");
gettext("11n");
gettext("11a");
gettext("11ac");

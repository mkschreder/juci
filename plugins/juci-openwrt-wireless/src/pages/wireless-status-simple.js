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
.controller("wirelessStatusSimplePage", function($scope, $rpc, $tr, gettext){
	JUCI.interval.repeat("wireless-refresh", 5000, function(done){
		$rpc.juci.wireless.devices().done(function(result){
			if(!result || !result.devices) return; 
			$scope.devices = result.devices.map(function(dev){
				dev._table = [
					[$tr(gettext("SSID")), dev.ssid],
					[$tr(gettext("Encryption")), dev.encryption.description],
					[$tr(gettext("BSSID")), dev.bssid],
					[$tr(gettext("Channel")), dev.channel], 
					[$tr(gettext("HW Modes")), Object.keys(dev.hwmodes)
						.filter(function(x){ return dev.hwmodes[x]; })
						.map(function(x){ return "11"+x; }).join(",")
					], 
					[$tr(gettext("TX Power")), dev.txpower+"dBm"], 
					[$tr(gettext("Bitrate")), (dev.bitrate/1000)+"Mbs"], 
					[$tr(gettext("Quality")), dev.quality], 
					[$tr(gettext("Signal")), dev.signal],
					[$tr(gettext("Noise")), dev.noise],
					//[$tr(gettext("Frequency")), ""+(parseFloat(dev.frequency)/1000.0)+" GHz"]
				]; 
				return dev; 
			}); 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
}); 

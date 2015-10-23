//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("OpenwrtWirelessStatusPage", function($scope, $rpc, $tr, gettext){
	JUCI.interval.repeat("wireless-refresh", 5000, function(done){
		$rpc.juci.openwrt.wireless.devices().done(function(result){
			if(!result || !result.devices) return; 
			$scope.devices = result.devices.map(function(dev){
				dev._table = [
					[$tr(gettext("SSID")), dev.ssid],
					[$tr(gettext("BSSID")), dev.bssid],
					[$tr(gettext("Channel")), dev.channel], 
					[$tr(gettext("Frequency")), ""+(parseFloat(dev.frequency)/1000.0)+" GHz"]
				]; 
				return dev; 
			}); 
			$scope.$apply(); 
			done(); 
		}); 
	}); 
}); 

//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("WifiSettingsPageCtrl", function($scope, $uci, gettext){
	function load(){
		$uci.sync("wireless").done(function(){
			$scope.devices = $uci.wireless["@wifi-device"].map(function(dev){ 
				// TODO: this should be a uci "displayname" or something
				var ret = { expanded: true, fields: dev }; 
				if(dev.band.value == "a") ret.frequency = gettext("5GHz"); 
				else if(dev.band.value == "b") ret.frequency = gettext("2.4GHz"); 
				else ret.frequency = gettext("Unknown"); 
				return ret; 
			}); 
			$scope.$apply(); 
		}); 
	} load(); 
	
}); 

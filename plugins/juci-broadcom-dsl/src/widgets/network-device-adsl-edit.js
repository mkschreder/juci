//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.directive("networkDeviceAdslEdit", function($compile){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-adsl-edit.html", 
		controller: "networkDeviceAdslEdit", 
		replace: true
	};  
})
.controller("networkDeviceAdslEdit", function($scope, $network, gettext){
	$network.getDevices().done(function(devices){
		var baseDevices = devices.filter(function(x){ return x.type == "adsl_baseif"; }).map(function(x){
			return {
				label: x.name, 
				value: x.id
			}
		}); 
		
		$scope.linkTypes = [
			{ label: "EoA", value: "EoA" }, 
			{ label: "PPPoA", value: "PPPoA" }, 
			{ label: "IPoA", value: "IPoA" }
		]; 
		
		$scope.encapModes = [
			{ label: "LLC/SNAP-Bridging", value: "llcsnap_eth" }, 
			{ label: "VC/MUX", value: "vcmux_eth" }
		]; 
		
		$scope.serviceTypes = [
			{ label: gettext("UBR Without PCR"), value: "ubr" }, 
			{ label: gettext("UBR With PCR"), value: "ubr_pcr" }, 
			{ label: gettext("CBR"), value: "cbr" }, 
			{ label: gettext("Non-Realtime VBR"), value: "nrtvbr" }, 
			{ label: gettext("Realtime VBR"), value: "rtvbr" }, 
		]; 
		
		$scope.baseDevices = baseDevices; 
		$scope.$apply(); 
		
		$scope.$watch("device", function(value){
			if(!value) return; 
				$scope.conf = value.base || value;
		}); 
	}); 
}); 

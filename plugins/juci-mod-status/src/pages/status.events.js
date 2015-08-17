//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusEventsPageCtrl", function($scope, $rpc){
	var allLogTypes = ["error", "warning", "info"]; 
	$scope.selectedShowType = allLogTypes; 
	$scope.selectedLogTypes = ["system", "network", "other"]; 
	
	var groups = {
		"system": ["dropbear", "peripheral_manager"], 
		"network": ["netifd", "brcmnetlink", "dnsmasq-dhcp", "dnsmasq"]
	}; 
	
	JUCI.interval.repeat("syslog", 1000, function(done){
		$rpc.juci.system.log().done(function(result){
			if(result && result.lines){
				$scope.logs = result.lines; 
				$scope.$apply(); 
				done(); 
			}
		}); 
	}); 
	$scope.allLogTypes = [
		{ label: "System", value: "system" }, 
		//{ label: "WAN", value: "wan" }, 
		{ label: "Network", value: "network" }, 
		{ label: "Other", value: "other" }
		//{ label: "LAN", value: "lan" }, 
		//{ label: "Voice", value: "voice" }, 
		//{ label: "Data", value: "data" }, 
		//{ label: "IPTV", value: "iptv" }, 
		//{ label: "USB", value: "usb" }, 
		//{ label: "Firewall", value: "firewall" }
	]; 
	$scope.allEventTypes = [
		{ label: "Only Errors & Warnings", value: ["error", "warning"] }, 
		{ label: "All Events", value: ["error", "warning", "info"] }
	];
	$scope.lineClass = function(line){
		if(line.type.indexOf("error") >= 0) return "label-danger"; 
		if(line.type.indexOf("warn") >= 0) return "label-warning";  
		if(line.type.indexOf("notice") >= 0) return "label-info"; 
		return ""; 
	}
	
	function onChange(){
		console.log(JSON.stringify($scope.selectedLogTypes) + $scope.selectedShowType); 
	}
	$scope.onTypeChanged = function(type){
		$scope.selectedShowType = type; 
		onChange(); 
	}
	$scope.$watchCollection("selectedLogTypes", function(){ onChange(); }); 
}); 

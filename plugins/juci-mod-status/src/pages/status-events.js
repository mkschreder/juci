//! Author: Martin K. Schröder <mkschreder.uk@gmail.com>

JUCI.app
.controller("StatusEventsPageCtrl", function($scope, $rpc){
	var allLogTypes = ["error", "warning", "info"]; 
	var log = {
		autoRefresh : true
	};
	var timeoutID = undefined;
	var request = null;
	$scope.data = { filter: "" };
	$scope.selectedShowType = allLogTypes; 
	$scope.selectedLogTypes = ["system", "network", "other"]; 
	
	var groups = {
		"system": ["dropbear", "peripheral_manager"], 
		"network": ["netifd", "brcmnetlink", "dnsmasq-dhcp", "dnsmasq"]
	}; 

	function update(){
		if(request === null){
			request = $rpc.juci.system.log({"filter":$scope.data.filter}).done(function(result){
				console.log("test "+$scope.data.filter+" "+result.lines);
				if(result && result.lines){
					$scope.logs = result.lines; 
					$scope.$apply();
				}
			}).always(function(){
				request = null;
			}); 
		}
		return request;
	}

	$scope.applyFilter = function(){
		$scope.inprogress = true;
		if(typeof timeoutID === "number"){
			clearTimeout(timeoutID);
		}
		log.autoRefresh = false;
		timeoutID = setTimeout(function(){log.autoRefresh = true;}, 1000);
		update().always(function() {
			$scope.inprogress = false;
			$scope.$apply();	
		});
	};

	JUCI.interval.repeat("syslog", 1000, function(done){
		if(!log.autoRefresh){
			done();
			return;
		}
		update().always(function(){
			done();
		});;
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
